use crate::middleware::protect_route::JwtGuard;
use crate::{database, models};
use rocket::http::Status;
use rocket::response::Responder;
use rocket::serde::{json::Json, Deserialize, Serialize};
use rocket_db_pools::Connection;

// get servers with server_type = sever for user for sidebar
// #[get("/get/<server_type>")]
// pub async fn get_channels(
//     guard: JwtGuard,
//     channel_id: i32,
//     mut db: Connection<database::HarmonyDb>,
// ) -> impl Responder {
//     let user_id = &guard.0.sub;
// }
