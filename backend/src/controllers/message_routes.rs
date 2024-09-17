use crate::middleware::protect_route::JwtGuard;
use crate::models::{ServerSessionIdMap, SessionIdWebsocketMap};
use crate::{
    database,
    models::{self, ErrorResponse},
    utils::{self, json_error::json_error},
};
use argon2::password_hash::rand_core::Error;

use rocket::futures::SinkExt;
use rocket::http::Status;
use rocket::response::status;
use rocket::response::Responder;
use rocket::serde::{json::Json, Deserialize, Serialize};

use rocket_db_pools::Connection;
use utils::user_membership::{ByChannel, ByServer, UserMembershipChecker};

#[post("/send", format = "json", data = "<message_json>")]
pub async fn send_message(
    guard: JwtGuard,
    message_json: Json<models::SendMessageInput>,
    mut db: Connection<database::HarmonyDb>,
    websocket_map_state: &rocket::State<SessionIdWebsocketMap>,
    server_map_state: &rocket::State<ServerSessionIdMap>,
) -> Result<(Status, Json<models::Message>), (Status, Json<ErrorResponse>)> {
    let user_id = &guard.0.sub;
    let channel_id = message_json.channel_id;
    let server_id = message_json.server_id;
    let message = &message_json.message;

    // check if user is in the server that has the channel the message is being sent to
    let channel_checker = ByChannel { channel_id };
    channel_checker.user_in_server(&mut db, *user_id).await?;

    let message = sqlx::query_as!(
        models::Message,
        "INSERT INTO messages (user_id, channel_id, message)
        VALUES ($1, $2, $3)
        RETURNING *",
        user_id,
        channel_id,
        message
    )
    .fetch_one(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, json_error("database error")))?;

    // turn to json string
    let message_json = serde_json::to_string(&message).map_err(|_| {
        (
            Status::InternalServerError,
            json_error("serialization error"),
        )
    })?;

    let websocket_map_state = websocket_map_state.inner().clone();
    let server_map_state = server_map_state.inner().clone();
    {
        let websocket_map = websocket_map_state.lock().await;
        let server_map = server_map_state.lock().await;

        if let Some(arc_mutex_vec) = server_map.get(&server_id) {
            let senders_session_id = arc_mutex_vec.lock().await;
            for sender_session_id in senders_session_id.iter() {
                if let Some(sender_arc_mutex) = websocket_map.get(sender_session_id) {
                    let mut sender = sender_arc_mutex.lock().await;
                    if let Err(e) = sender.send(message_json.clone().into()).await {
                        eprintln!("Error sending message: {:?}", e);
                    }
                } else {
                    println!(
                        "No WebSocket sender found for session ID: {:?}",
                        sender_session_id
                    );
                }
            }
        } else {
            println!("No session IDs found for server ID: {:?}", server_id);
        }
    }

    // // Broadcast the message to all connected clients in the channel
    // let state = state.inner().clone();
    // {
    //     let mut channels = state.lock().await;
    //     if let Some(senders) = channels.get_mut(&channel_id) {
    //         for sender in senders.iter() {
    //             let mut sender = sender.lock().await;
    //             if let Err(e) = sender.send(message_json.clone().into()).await {
    //                 eprintln!("Failed to send message to a client: {:?}", e);
    //             }
    //         }
    //     }
    // }

    // Ok::<_, (Status, Json<ErrorResponse>)>(status::Created::new("/send").body(Json(message)))
    Ok::<_, (Status, Json<ErrorResponse>)>((Status::Created, Json(message)))
}

// gets all messages from a channel (should this be in channels routes)
#[get("/get/<channel_id>")]
pub async fn get_messages(
    guard: JwtGuard,
    channel_id: i32,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<Vec<models::Message>>, (Status, Json<ErrorResponse>)> {
    let user_id = &guard.0.sub;

    let channel_checker = ByChannel { channel_id };
    channel_checker.user_in_server(&mut db, *user_id).await?;

    let messages = sqlx::query_as!(
        models::Message,
        "SELECT * FROM messages WHERE channel_id = $1
        ORDER BY message_id ASC",
        channel_id
    )
    .fetch_all(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, json_error("database error")))?;

    Ok(Json(messages))
}
