use crate::middleware::protect_route::JwtGuard;
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

#[post("/send/<channel_id>", format = "json", data = "<message>")]
pub async fn send_message(
    guard: JwtGuard,
    channel_id: i32,
    message: Json<models::SendMessageInput>,
    mut db: Connection<database::HarmonyDb>,
    // state: &rocket::State<UserStreamMap>,
) -> Result<(Status, Json<models::Message>), (Status, Json<ErrorResponse>)> {
    let user_id = &guard.0.sub;

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
        message.message
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
