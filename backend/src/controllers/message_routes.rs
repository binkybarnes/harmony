use crate::middleware::protect_route::JwtGuard;
use crate::models::{
    MessageWithServer, ServerSessionIdMap, ServerType, SessionIdWebsocketMap, WebSocketEvent,
};
use crate::utils::broadcast_ws_message::broadcast_to_server;
use crate::{
    database,
    models::{self, ErrorResponse},
    utils::{self, json_error::json_error},
};

use rocket::http::Status;

use rocket::serde::json::Json;

use rocket_db_pools::Connection;
use utils::user_membership::{ByChannel, UserMembershipChecker};

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
    let server_type = message_json.server_type;
    let message = &message_json.message;

    let display_username = &message_json.display_username;
    let s3_icon_key = &message_json.s3_icon_key;

    // check if user is in the server that has the channel the message is being sent to
    let channel_checker = ByChannel { channel_id };
    channel_checker.user_in_server(&mut db, *user_id).await?;

    // !TODO: maybe restrict to only dms and groupchats
    let message = sqlx::query_as!(
        models::Message,
        "INSERT INTO messages (user_id, channel_id, message, display_username, s3_icon_key)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *",
        user_id,
        channel_id,
        message,
        display_username,
        s3_icon_key.as_deref()
    )
    .fetch_one(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, json_error("database error")))?;

    // update timestamp of the last message
    sqlx::query!(
        "UPDATE servers
                SET last_message_at = $1
                WHERE server_id = $2",
        message.timestamp,
        server_id
    )
    .execute(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, json_error("database error")))?;

    // update last message id
    sqlx::query!(
        "UPDATE servers
        SET last_message_id = $1
        WHERE server_id = $2",
        message.message_id,
        server_id
    )
    .execute(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, json_error("database error")))?;

    let event = WebSocketEvent::Message(MessageWithServer {
        message: message.clone(),
        server_type,
        server_id,
    });
    // turn to json string
    let message_json = serde_json::to_string(&event).map_err(|_| {
        (
            Status::InternalServerError,
            json_error("serialization error"),
        )
    })?;

    // broadcast message to everyone in the server
    broadcast_to_server(
        &message_json,
        server_id,
        websocket_map_state.inner().clone(),
        ServerSessionIdMap(server_map_state.0.clone()),
    )
    .await;

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
