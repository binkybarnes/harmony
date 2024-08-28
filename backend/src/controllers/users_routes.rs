use crate::database::HarmonyDb;
use crate::models::{ErrorResponse, ServerIds, User};
use crate::utils::json_error::json_error;
use rocket::http::uri::Query;
use rocket::http::Status;
use rocket::response::Responder;
use rocket::serde::json::Json;
use rocket_db_pools::Connection;
// get users given vector of server_ids
#[get("/get/users?<server_ids>")]
pub async fn get_users(
    server_ids: Vec<i32>,
    mut db: Connection<HarmonyDb>,
) -> Result<Json<Vec<Vec<User>>>, (Status, Json<ErrorResponse>)> {
    let mut users_list: Vec<Vec<User>> = Vec::new();
    for server_id in &server_ids {
        let users = sqlx::query_as!(
            User,
            "SELECT u.user_id, display_username, profile_picture, date_joined
            FROM users u
            JOIN users_servers us ON u.user_id = us.user_id
            WHERE us.server_id = $1",
            server_id
        )
        .fetch_all(&mut **db)
        .await
        .map_err(|_| (Status::BadRequest, json_error("Database error")))?;
        if users.is_empty() {
            return Err((
                Status::BadRequest,
                json_error(&format!("No server matching server_id: {:?}", server_id)),
            ));
        }
        users_list.push(users);
    }

    Ok(Json(users_list))
}
