use crate::middleware::protect_route::JwtGuard;
use crate::{database, models, utils};
use rocket::http::Status;
use rocket::response::Responder;
use rocket::serde::{json::Json, Deserialize, Serialize};
use rocket_db_pools::Connection;

use utils::user_membership::{ByChannel, ByServer, UserMembershipChecker};

// get channels in the given server
#[get("/get/<server_id>")]
pub async fn get_channels(
    guard: JwtGuard,
    server_id: i32,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<Vec<models::Channel>>, (Status, &'static str)> {
    let user_id = &guard.0.sub;

    let server_checker = ByServer { server_id };
    server_checker.user_in_server(&mut db, *user_id).await?;

    let channels = sqlx::query_as!(
        models::Channel,
        "SELECT * FROM channels
        WHERE server_id = $1",
        server_id
    )
    .fetch_all(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, "database error"))?;

    Ok::<_, (Status, &str)>(Json(channels))
}
