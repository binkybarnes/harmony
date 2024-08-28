use crate::database::HarmonyDb;
use crate::models::{ErrorResponse, GetUsersInput, User};
use crate::utils::json_error::json_error;
use rocket::http::Status;
use rocket::response::Responder;
use rocket::serde::json::Json;
use rocket_db_pools::Connection;
// get users given vector of server_ids
#[get("/get", format = "json", data = "<server_ids_json>")]
pub async fn get_users(
    server_ids_json: Json<GetUsersInput>,
    mut db: Connection<HarmonyDb>,
) -> Result<Json<Vec<Vec<User>>>, (Status, Json<ErrorResponse>)> {
    let mut users_list: Vec<Vec<User>> = Vec::new();
    for server_id in &server_ids_json.server_ids {
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
                json_error(&format!("No server matching server_id: {}", server_id)),
            ));
        }
        users_list.push(users);
    }

    Ok(Json(users_list))
}
