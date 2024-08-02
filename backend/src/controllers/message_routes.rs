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

    // check if user is in the server that has the channel the message is being sent to
    let server_id = sqlx::query_scalar!(
        "SELECT server_id FROM channels WHERE channel_id = $1",
        message.channel_id
    )
    .fetch_optional(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, "database error"))?
    .ok_or((Status::NotFound, "channel not found"))?;

    sqlx::query_scalar!(
        "SELECT 1 FROM users_servers WHERE user_id = $1 AND server_id = $2",
        user_id,
        server_id
    )
    .fetch_optional(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, "database error"))?
    .ok_or((Status::Forbidden, "user not in server"))?;

    // if user_in_server.is_none() {
    //     return Err((Status::Forbidden, "user not in server"));
    // }

    sqlx::query!(
        "INSERT INTO messages (user_id, channel_id, message)
        VALUES ($1, $2, $3)",
        user_id,
        message.channel_id,
        message.message
    )
    .execute(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, "database error"))?;

    let response = Json(models::SendMessageResponse {
        user_id: *user_id,
        channel_id: message.channel_id,
        message: message.message,
    });

    Ok::<_, (Status, &str)>(status::Created::new("/send").body(response))
}

// #[get("/get", format = "json", data = "<channel>")]
// pub async fn get_messages(guard: JwtGuard, channel: Json<models::GetMessagesInput>) {

//     // check if channel exists
//     let channel_id = channel.channel_id;

//     sqlx::query_scala!(
//         "SELECT 1 FROM channels WHERE channel_id = $1"
//     )

//     sqlx::query!(
//         "SELECT * FROM messages WHERE channel_id = $1",
//         channel_id
//     )
// }
