use crate::middleware::protect_route::JwtGuard;
use crate::{
    database,
    models::{self, ErrorResponse},
    utils::{self, json_error::json_error},
};
use rocket::http::Status;
use rocket::response::status;
use rocket::response::Responder;
use rocket::serde::{json::Json, Deserialize, Serialize};
use rocket_db_pools::Connection;
use utils::user_membership::{ByChannel, ByServer, UserMembershipChecker};

#[post("/send", format = "json", data = "<message>")]
pub async fn send_message(
    guard: JwtGuard,
    message: Json<models::SendMessageInput<'_>>,
    mut db: Connection<database::HarmonyDb>,
) -> impl Responder {
    let user_id = &guard.0.sub;
    let channel_id = message.channel_id;
    // check if user is in the server that has the channel the message is being sent to
    let channel_checker = ByChannel { channel_id };
    channel_checker.user_in_server(&mut db, *user_id).await?;

    let message = sqlx::query_as!(
        models::Message,
        "INSERT INTO messages (user_id, channel_id, message)
        VALUES ($1, $2, $3)
        RETURNING *",
        user_id,
        message.channel_id,
        message.message
    )
    .fetch_one(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, json_error("database error")))?;

    Ok::<_, (Status, Json<ErrorResponse>)>(status::Created::new("/send").body(Json(message)))
}

// gets all messages from a channel
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
        "SELECT * FROM messages WHERE channel_id = $1",
        channel_id
    )
    .fetch_all(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, json_error("database error")))?;

    Ok(Json(messages))
}
