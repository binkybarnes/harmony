use crate::middleware::protect_route::JwtGuard;
use crate::models::ServerType;
use crate::utils::json_error::json_error;
use crate::{
    database,
    models::{self, ErrorResponse},
};
use rocket::http::Status;
use rocket::response::Responder;
use rocket::serde::{json::Json, Deserialize, Serialize};
use rocket::Error;
use rocket_db_pools::Connection;

// get servers with server_type = sever for user for sidebar
#[get("/get/<server_type>")]
pub async fn get_servers(
    guard: JwtGuard,
    server_type: &str,
    mut db: Connection<database::HarmonyDb>,
) -> impl Responder {
    let user_id = &guard.0.sub;

    // validate server_type
    let server_type_enum = match server_type.to_lowercase().as_str() {
        "server" => ServerType::Server,
        "dm" => ServerType::Dm,
        "groupchat" => ServerType::GroupChat,
        _ => return Err((Status::BadRequest, json_error("Invalid server type"))),
    };

    // get servers
    let servers = sqlx::query_as!(
        models::Server,
        r#"SELECT 
        s.server_id, s.server_type AS "server_type!: ServerType", members
        FROM servers s
        JOIN users_servers us ON us.server_id = s.server_id
        WHERE us.user_id = $1 AND s.server_type = $2"#,
        user_id,
        server_type_enum as ServerType
    )
    .fetch_all(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, json_error("Database error")))?;

    Ok(Json(servers))
}

#[post("/join/<server_id>")]
pub async fn join_server(
    guard: JwtGuard,
    server_id: i32,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<models::Server>, (Status, Json<ErrorResponse>)> {
    let user_id = &guard.0.sub;
    // check if server exists
    let server = sqlx::query_as!(
        models::Server,
        r#"SELECT
        server_id, server_type AS "server_type!: ServerType", members
        FROM servers WHERE server_id = $1"#,
        server_id
    )
    .fetch_optional(&mut **db)
    .await
    .map_err(|_| (Status::InternalServerError, json_error("Database error")))?
    .ok_or((Status::NotFound, json_error("Server not found")))?;

    // check if user already in server
    let user_in_server = sqlx::query_scalar!(
        "SELECT 1 FROM users_servers
        WHERE user_id = $1 AND server_id = $2;",
        user_id,
        server_id
    )
    .fetch_optional(&mut **db)
    .await
    .map_err(|_| (Status::InternalServerError, json_error("Database error")))?;
    if user_in_server.is_some() {
        return Err((Status::BadRequest, json_error("User already in server")));
    }

    // // join server
    // sqlx::query!(
    //     "INSERT INTO public.users_servers (user_id, server_id)
    // VALUES ($1, $2)",
    //     user_id,
    //     server_id
    // )
    // .execute(&mut **db)
    // .await
    // .map_err(|_| (Status::InternalServerError, json_error("Database error")))?;

    // // update members count
    // sqlx::query!(
    //     "UPDATE servers SET members = members + 1 where server_id = $1",
    //     server_id
    // )
    // .execute(&mut **db)
    // .await
    // .map_err(|_| (Status::InternalServerError, json_error("Database error")))?;

    join_server_helper(*user_id, server_id, &mut db);

    Ok::<_, (Status, Json<ErrorResponse>)>(Json(server))
}

#[post("/create", format = "json", data = "<server>")]
pub async fn create_server(
    guard: JwtGuard,
    server: Json<models::CreateServerInput>,
    mut db: Connection<database::HarmonyDb>,
) -> Result<(), (Status, Json<ErrorResponse>)> {
    let server_type = server.server_type;
    let recipient_id = server.recipient_id;
    let user_id = &guard.0.sub;

    // make server
    let server_id: i32 = create_server_helper(server_type, &mut db).await?;
    // make sender join server
    join_server_helper(*user_id, server_id, &mut db).await?;
    // make recipient join server
    join_server_helper(recipient_id, server_id, &mut db).await?;

    // todo!("implement groupchat");
    Ok(())
}

async fn create_server_helper(
    server_type: ServerType,
    db: &mut Connection<database::HarmonyDb>,
) -> Result<i32, (Status, Json<ErrorResponse>)> {
    let members: i32 = match server_type {
        ServerType::Dm => 2,
        ServerType::Server => 1,
        ServerType::GroupChat => {
            println!("NOT IMPLEMENTED YET");
            99
            // NOT IMPLEMENTED YET
        }
    };

    // make server
    let server = sqlx::query_as!(
        models::Server,
        r#"INSERT INTO public.servers (server_type, members)
        VALUES ($1, $2) 
        RETURNING server_id, server_type AS "server_type!: ServerType", members"#,
        server_type as ServerType,
        members
    )
    .fetch_one(&mut ***db)
    .await
    .map_err(|_| (Status::InternalServerError, json_error("Database error")))?;
    let server_id: i32 = server.server_id;

    Ok(server_id)
}
async fn join_server_helper(
    user_id: i32,
    server_id: i32,
    db: &mut Connection<database::HarmonyDb>,
) -> Result<(), (Status, Json<ErrorResponse>)> {
    // join server
    sqlx::query!(
        "INSERT INTO public.users_servers (user_id, server_id)
    VALUES ($1, $2)",
        user_id,
        server_id
    )
    .execute(&mut ***db)
    .await
    .map_err(|_| (Status::InternalServerError, json_error("Database error")))?;

    // update members count
    sqlx::query!(
        "UPDATE servers SET members = members + 1 where server_id = $1",
        server_id
    )
    .execute(&mut ***db)
    .await
    .map_err(|_| (Status::InternalServerError, json_error("Database error")))?;

    Ok(())
}
