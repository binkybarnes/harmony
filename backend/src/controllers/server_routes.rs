use crate::middleware::protect_route::JwtGuard;
use crate::{database, models};
use rocket::http::hyper::server;
use rocket::http::Status;
use rocket::response::status;
use rocket::response::Responder;
use rocket::serde::{json::Json, Deserialize, Serialize};
use rocket_db_pools::Connection;

// get servers with server_type = sever for user for sidebar
#[get("/get/<server_type>")]
pub async fn get_servers<'a>(
    guard: JwtGuard,
    server_type: &str,
    mut db: Connection<database::HarmonyDb>,
) -> impl Responder<'a, 'a> {
    let user_id = &guard.0.sub;

    println!("server type {}", server_type);
    let server_type_enum = match server_type.to_lowercase().as_str() {
        "server" => models::ServerType::Server,
        "dm" => models::ServerType::Dm,
        "groupchat" => models::ServerType::GroupChat,
        _ => return Err((Status::BadRequest, "invalid server type")),
    };

    let servers = sqlx::query_as!(
        models::Server,
        r#"SELECT 
        s.server_id, s.server_type AS "server_type!: models::ServerType", members
        FROM servers s
        JOIN users_servers us ON us.server_id = s.server_id
        WHERE us.user_id = $1 AND s.server_type = $2"#,
        user_id,
        server_type_enum as models::ServerType
    )
    .fetch_all(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, "database error"))?;

    if servers.is_empty() {
        return Err((Status::NotFound, "no servers found for the given criteria"));
    }

    Ok(Json(servers))
}
