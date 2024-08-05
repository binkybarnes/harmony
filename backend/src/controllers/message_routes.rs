use crate::middleware::protect_route::JwtGuard;
use crate::{database, models};
use rocket::http::Status;
use rocket::response::status;
use rocket::response::Responder;
use rocket::serde::{json::Json, Deserialize, Serialize};
use rocket_db_pools::Connection;
pub struct MyError {
    status: Status,
    message: String,
}
#[post("/send", format = "json", data = "<message>")]
pub async fn send_message(
    guard: JwtGuard,
    message: Json<models::SendMessageInput<'_>>,
    mut db: Connection<database::HarmonyDb>,
) -> impl Responder {
    let user_id = &guard.0.sub;
    let channel_id = message.channel_id;
    // check if user is in the server that has the channel the message is being sent to
    user_in_server(&mut db, channel_id, *user_id).await?;

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
    .map_err(|_| (Status::BadRequest, "database error"))?;

    // let response = Json(models::SendMessageResponse {
    //     user_id: *user_id,
    //     channel_id: message.channel_id,
    //     message: message.message,
    // });

    Ok::<_, (Status, &str)>(status::Created::new("/send").body(Json(message)))
}

// gets all messages from a channel
#[get("/get", format = "json", data = "<channel>")]
pub async fn get_messages(
    guard: JwtGuard,
    channel: Json<models::GetMessagesInput>,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<Vec<models::Message>>, (Status, &'static str)> {
    // check if channel exists
    let channel_id = channel.channel_id;
    let user_id = &guard.0.sub;

    user_in_server(&mut db, channel_id, *user_id).await?;

    let messages = sqlx::query_as!(
        models::Message,
        "SELECT * FROM messages WHERE channel_id = $1",
        channel_id
    )
    .fetch_all(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, "database error"))?;

    Ok(Json(messages))
}

// check user membership in a server
async fn user_in_server(
    db: &mut Connection<database::HarmonyDb>,
    channel_id: i32,
    user_id: i32,
) -> Result<(), (Status, &'static str)> {
    // Fetch server_id from channel
    let server_id = sqlx::query_scalar!(
        "SELECT server_id FROM channels WHERE channel_id = $1",
        channel_id
    )
    .fetch_optional(&mut ***db)
    .await
    .map_err(|_| (Status::InternalServerError, "database error"))?
    .ok_or((Status::NotFound, "channel not found"))?;

    // Check if the user is in the server
    sqlx::query_scalar!(
        "SELECT 1 FROM users_servers WHERE user_id = $1 AND server_id = $2",
        user_id,
        server_id
    )
    .fetch_optional(&mut ***db)
    .await
    .map_err(|_| (Status::InternalServerError, "database error"))?
    .ok_or((Status::Forbidden, "user not in server"))?;

    Ok(())
}
