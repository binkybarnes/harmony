use crate::middleware::protect_route::JwtGuard;
use crate::models::{Channel, CreateChannelInput, Server, ServerIds, ServerType, User};
use crate::utils::{
    json_error::json_error,
    user_membership::{ByChannel, ByServer, UserMembershipChecker},
};
use crate::{
    database,
    models::{self, ErrorResponse},
};
use rocket::http::Status;
use rocket::response::Responder;
use rocket::serde::{json::Json, Deserialize, Serialize};
use rocket::Error;
use rocket_db_pools::Connection;
use validator::{Validate, ValidationErrors};

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
        s.server_id, s.server_type AS "server_type!: ServerType", members, server_name, admins
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

#[get("/searchName?<name>")]
pub async fn search_servers_name(
    _guard: JwtGuard,
    name: String,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<Vec<Server>>, (Status, Json<ErrorResponse>)> {
    let servers = sqlx::query_as!(
        Server,
        r#"SELECT
        server_id, server_type AS "server_type!: ServerType", members, server_name, admins
        FROM servers
        WHERE server_type = 'server' AND server_name % $1
        ORDER BY (SIMILARITY(server_name, 'skibidi') * 0.3 + LOG(members + 1) * 0.7) DESC
        LIMIT 100"#,
        name
    )
    .fetch_all(&mut **db)
    .await
    .map_err(|_| (Status::InternalServerError, json_error("Database error")))?;

    Ok(Json(servers))
}

// TODO: maybe fuzzy search ID?
#[get("/searchId?<id>")]
pub async fn search_servers_id(
    _guard: JwtGuard,
    id: i32,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<Vec<Server>>, (Status, Json<ErrorResponse>)> {
    let servers = sqlx::query_as!(
        Server,
        r#"SELECT
        server_id, server_type AS "server_type!: ServerType", members, server_name, admins
        FROM servers
        WHERE server_type = 'server' AND server_id = $1"#,
        id
    )
    .fetch_all(&mut **db)
    .await
    .map_err(|_| (Status::InternalServerError, json_error("Database error")))?;

    Ok(Json(servers))
}

// get the top 50 servers with the most members
#[get("/popular")]
pub async fn get_servers_popular(
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<Vec<Server>>, (Status, Json<ErrorResponse>)> {
    let servers = sqlx::query_as!(
        Server,
        r#"
        SELECT server_id, server_type AS "server_type!: ServerType", members, server_name, admins
        FROM SERVERS
        WHERE server_type = 'server'
        ORDER BY members DESC
        LIMIT 50"#
    )
    .fetch_all(&mut **db)
    .await
    .map_err(|_| (Status::InternalServerError, json_error("Database error")))?;

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
        server_id, server_type AS "server_type!: ServerType", members, server_name, admins
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

    join_server_helper(*user_id, server_id, &mut db).await?;

    Ok::<_, (Status, Json<ErrorResponse>)>(Json(server))
}

// WARNING, does not check for duplicate DM's with the same person
#[post("/create", format = "json", data = "<server>")]
pub async fn create_server(
    guard: JwtGuard,
    server: Json<models::CreateServerInput>,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<Server>, (Status, Json<ErrorResponse>)> {
    server
        .validate()
        .map_err(|_| (Status::BadRequest, json_error("Failed JSON validation")))?;

    let server_type: ServerType = server.server_type;
    let recipient_ids: &Vec<i32> = &server.recipient_ids;
    let server_name: &String = &server.server_name;
    let user_id: &i32 = &guard.0.sub;

    // validate num recipients given server type
    let recipients_len = recipient_ids.len();
    match server_type {
        ServerType::Server => {
            if recipients_len != 0 {
                return Err((
                    Status::BadRequest,
                    json_error("Server type server should not have recipients on creation"),
                ));
            };
        }
        ServerType::Dm => {
            if recipients_len != 1 {
                return Err((
                    Status::BadRequest,
                    json_error("Server type dm should have 1 recipient"),
                ));
            };
            if recipient_ids[0] == *user_id {
                return Err((
                    Status::BadRequest,
                    json_error("Can not create DM with yourself"),
                ));
            }
        }
        ServerType::GroupChat => {
            if recipients_len < 2 {
                return Err((
                    Status::BadRequest,
                    json_error("Server type groupchat should have at least 2 recipients"),
                ));
            };
        }
    };

    // make server
    let server = create_server_helper(server_type, server_name, *user_id, &mut db).await?;
    let server_id: i32 = server.server_id;
    // make sender join server
    join_server_helper(*user_id, server_id, &mut db).await?;
    // make recipients join server
    for recipient in recipient_ids.iter() {
        join_server_helper(*recipient, server_id, &mut db).await?;
    }

    Ok(Json(server))
}

async fn create_channel_helper(
    server_id: i32,
    channel_name: &str,
    db: &mut Connection<database::HarmonyDb>,
) -> Result<Channel, (Status, Json<ErrorResponse>)> {
    // create a channel with name default
    let channel = sqlx::query_as!(
        Channel,
        "INSERT INTO channels (server_id, channel_name)
        VALUES ($1, $2)
        RETURNING *",
        server_id,
        channel_name
    )
    .fetch_one(&mut ***db)
    .await
    .map_err(|_| {
        (
            Status::InternalServerError,
            json_error("Database error; does server_id exist?"),
        )
    })?;

    Ok(channel)
}

async fn create_server_helper(
    server_type: ServerType,
    server_name: &String,
    user_id: i32,
    db: &mut Connection<database::HarmonyDb>,
) -> Result<Server, (Status, Json<ErrorResponse>)> {
    // make server
    // num members initially 0, members will be incremented in join_server
    let server = sqlx::query_as!(
        models::Server,
        r#"INSERT INTO public.servers (server_type, members, server_name, admins)
        VALUES ($1, 0, $2, ARRAY[$3]::integer[]) 
        RETURNING server_id, server_type AS "server_type!: ServerType", members, server_name, admins"#,
        server_type as ServerType,
        server_name,
        user_id
    )
    .fetch_one(&mut ***db)
    .await
    .map_err(|_| (Status::InternalServerError, json_error("Database error")))?;
    let server_id: i32 = server.server_id;

    create_channel_helper(server_id, "general", db).await?;

    Ok(server)
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
    .map_err(|_| {
        (
            Status::InternalServerError,
            json_error(&format!(
                "Database error; does recipient_id {} exist?",
                user_id
            )),
        )
    })?;

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

// CHANNELS -----------------------------------------------------------------
// get channels given 1 server_id
#[get("/channels/<server_id>")]
pub async fn get_channels(
    _guard: JwtGuard,
    server_id: i32,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<Vec<Channel>>, (Status, Json<ErrorResponse>)> {
    let channels = get_channels_helper(server_id, &mut db).await?;
    Ok(Json(channels))
}
// get list of channels list given server_id list
#[post("/channels-list", format = "json", data = "<server_ids_json>")]
pub async fn get_channels_list(
    _guard: JwtGuard,
    server_ids_json: Json<ServerIds>,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<Vec<Vec<Channel>>>, (Status, Json<ErrorResponse>)> {
    // let user_id = &guard.0.sub;

    let mut channels_list: Vec<Vec<Channel>> = Vec::new();
    for server_id in server_ids_json.server_ids.iter() {
        // let server_checker = ByServer {
        //     server_id: *server_id,
        // };
        // server_checker.user_in_server(&mut db, *user_id).await?;
        let channels = get_channels_helper(*server_id, &mut db).await?;
        channels_list.push(channels);
    }
    Ok::<_, (Status, Json<ErrorResponse>)>(Json(channels_list))
}

// returns a list of channels of given server_id
async fn get_channels_helper(
    server_id: i32,
    db: &mut Connection<database::HarmonyDb>,
) -> Result<Vec<Channel>, (Status, Json<ErrorResponse>)> {
    let channels = sqlx::query_as!(
        models::Channel,
        "SELECT * FROM channels
        WHERE server_id = $1",
        server_id
    )
    .fetch_all(&mut ***db)
    .await
    .map_err(|_| (Status::BadRequest, json_error("Database error")))?;

    Ok(channels)
}

// create channel
// TODO check if the user is an admin in the server
#[post("/channels/create", format = "json", data = "<channel_json>")]
pub async fn create_channel(
    _guard: JwtGuard,
    channel_json: Json<CreateChannelInput>,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<Channel>, (Status, Json<ErrorResponse>)> {
    channel_json
        .validate()
        .map_err(|_| (Status::BadRequest, json_error("Failed JSON validation")))?;

    let server_id: i32 = channel_json.server_id;
    let channel_name: &String = &channel_json.channel_name;

    let channel = create_channel_helper(server_id, channel_name, &mut db).await?;

    Ok(Json(channel))
}

// USERS -----------------------------------------------------------------

// get users given one server_id
#[get("/users/<server_id>")]
pub async fn get_users(
    _guard: JwtGuard,
    server_id: i32,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<Vec<User>>, (Status, Json<ErrorResponse>)> {
    let users = get_users_helper(server_id, &mut db).await?;
    Ok(Json(users))
}

// get list of users given vector of server_ids
#[post("/users-list", format = "json", data = "<server_ids_json>")]
pub async fn get_users_list(
    _guard: JwtGuard,
    server_ids_json: Json<ServerIds>,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<Vec<Vec<User>>>, (Status, Json<ErrorResponse>)> {
    let mut users_list: Vec<Vec<User>> = Vec::new();
    for server_id in &server_ids_json.server_ids {
        let users = get_users_helper(*server_id, &mut db).await?;
        users_list.push(users);
    }

    Ok(Json(users_list))
}

// returns a list of users in given server_id
async fn get_users_helper(
    server_id: i32,
    db: &mut Connection<database::HarmonyDb>,
) -> Result<Vec<User>, (Status, Json<ErrorResponse>)> {
    let users = sqlx::query_as!(
        User,
        "SELECT u.user_id, display_username, profile_picture, date_joined
        FROM users u
        JOIN users_servers us ON u.user_id = us.user_id
        WHERE us.server_id = $1",
        server_id
    )
    .fetch_all(&mut ***db)
    .await
    .map_err(|_| (Status::BadRequest, json_error("Database error")))?;

    Ok(users)
}
