use crate::middleware::protect_route::JwtGuard;
use crate::models::{
    Channel, CreateChannelInput, CreateServerInput, EditServerInput, OptionalServerChannel, S3File,
    Server, ServerChannel, ServerCreated, ServerIds, ServerSessionIdMap, ServerType,
    SessionIdWebsocketMap, User, UserJoin, UserSessionIdMap, WebSocketEvent,
};
use crate::utils::broadcast_ws_message::{broadcast_to_server, broadcast_to_users};
use crate::utils::{
    json_error::json_error,
    user_membership::{ByChannel, ByServer, UserMembershipChecker},
};
use crate::{
    database,
    models::{self, ErrorResponse},
};
use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::Client;
use rocket::form::Form;
use rocket::http::Status;
use rocket::response::Responder;
use rocket::serde::{json::Json, Deserialize, Serialize};
use rocket::Error;
use rocket::State;
use rocket_db_pools::Connection;
use validator::{Validate, ValidationErrors};

use super::websockets::add_user_to_server_map;

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
        s.server_id, s.server_type AS "server_type!: ServerType", members, server_name, admins, s3_icon_key
        FROM servers s
        JOIN users_servers us ON us.server_id = s.server_id
        WHERE us.user_id = $1 AND s.server_type = $2
        ORDER BY joined_date DESC"#,
        user_id,
        server_type_enum as ServerType
    )
    .fetch_all(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, json_error("Database error")))?;

    Ok(Json(servers))
}

// used in usermenu message button to check if dm exists
#[get("/dms/<recipient_id>")]
pub async fn get_dm(
    guard: JwtGuard,
    recipient_id: i32,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<OptionalServerChannel>, (Status, Json<ErrorResponse>)> {
    let user_id = &guard.0.sub;

    let server = sqlx::query_as!(
        Server,
        r#"
        SELECT
        s.server_id, s.server_type AS "server_type!: ServerType", s.members, s.server_name, s.admins, s.s3_icon_key
        FROM servers s
        JOIN users_servers us1 ON s.server_id = us1.server_id
        JOIN users_servers us2 ON s.server_id = us2.server_id
        WHERE s.server_type = 'dm'
        AND us1.user_id = $1
        AND us2.user_id = $2
        LIMIT 1
        "#,
        user_id,
        recipient_id
    )
    .fetch_optional(&mut **db)
    .await
    .map_err(|_| (Status::InternalServerError, json_error("Database error")))?;

    if let Some(server) = server {
        let channel = sqlx::query_as!(
            Channel,
            "SELECT * FROM channels
    WHERE server_id = $1",
            server.server_id
        )
        .fetch_one(&mut **db)
        .await
        .map_err(|_| (Status::BadRequest, json_error("Database error")))?;

        Ok(Json(OptionalServerChannel {
            server: Some(server),
            channel: Some(channel),
        }))
    } else {
        Ok(Json(OptionalServerChannel {
            server: None,
            channel: None,
        }))
    }
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
        server_id, server_type AS "server_type!: ServerType", members, server_name, admins, s3_icon_key
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
        server_id, server_type AS "server_type!: ServerType", members, server_name, admins, s3_icon_key
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
        SELECT server_id, server_type AS "server_type!: ServerType", members, server_name, admins, s3_icon_key
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
    websocket_map_state: &rocket::State<SessionIdWebsocketMap>,
    server_map_state: &rocket::State<ServerSessionIdMap>,
    user_map_state: &rocket::State<UserSessionIdMap>,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<models::Server>, (Status, Json<ErrorResponse>)> {
    let user_id = &guard.0.sub;
    // check if server exists
    let server = sqlx::query_as!(
        models::Server,
        r#"SELECT
        server_id, server_type AS "server_type!: ServerType", members, server_name, admins, s3_icon_key
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

    join_server_helper(
        *user_id,
        server_id,
        &mut db,
        server_map_state,
        user_map_state,
    )
    .await?;

    // broadcast user info to people online in the server (to update message map)
    let user = sqlx::query_as!(
        User,
        "SELECT user_id, display_username, profile_picture, date_joined
        FROM users WHERE user_id = $1",
        user_id
    )
    .fetch_one(&mut **db)
    .await
    .map_err(|_| (Status::InternalServerError, json_error("Database error")))?;

    let event = WebSocketEvent::UserJoin(UserJoin { user, server_id });
    // turn to json string
    let user_json = serde_json::to_string(&event).map_err(|_| {
        (
            Status::InternalServerError,
            json_error("serialization error"),
        )
    })?;
    broadcast_to_server(&user_json, server_id, websocket_map_state, server_map_state).await;

    Ok::<_, (Status, Json<ErrorResponse>)>(Json(server))
}

// WARNING, does not check for duplicate DM's with the same person
// #[post("/create", format = "json", data = "<server>")]
// pub async fn create_server(
//     guard: JwtGuard,
//     server: Json<models::CreateServerInput>,
//     mut db: Connection<database::HarmonyDb>,
// ) -> Result<Json<Server>, (Status, Json<ErrorResponse>)> {
//     server
//         .validate()
//         .map_err(|_| (Status::BadRequest, json_error("Failed JSON validation")))?;

//     let server_type: ServerType = server.server_type;
//     let recipient_ids: &Vec<i32> = &server.recipient_ids;
//     let server_name: &String = &server.server_name;
//     let user_id: &i32 = &guard.0.sub;

//     // validate num recipients given server type
//     let recipients_len = recipient_ids.len();
//     match server_type {
//         ServerType::Server => {
//             if recipients_len != 0 {
//                 return Err((
//                     Status::BadRequest,
//                     json_error("Server type server should not have recipients on creation"),
//                 ));
//             };
//         }
//         ServerType::Dm => {
//             if recipients_len != 1 {
//                 return Err((
//                     Status::BadRequest,
//                     json_error("Server type dm should have 1 recipient"),
//                 ));
//             };
//             if recipient_ids[0] == *user_id {
//                 return Err((
//                     Status::BadRequest,
//                     json_error("Can not create DM with yourself"),
//                 ));
//             }
//         }
//         ServerType::GroupChat => {
//             if recipients_len < 2 {
//                 return Err((
//                     Status::BadRequest,
//                     json_error("Server type groupchat should have at least 2 recipients"),
//                 ));
//             };
//         }
//     };

//     // make server
//     let server = create_server_helper(server_type, server_name, *user_id, &mut db).await?;
//     let server_id: i32 = server.server_id;
//     // make sender join server
//     join_server_helper(*user_id, server_id, &mut db).await?;
//     // make recipients join server
//     for recipient in recipient_ids.iter() {
//         join_server_helper(*recipient, server_id, &mut db).await?;
//     }

//     Ok(Json(server))
// }

// returns server and default channel
#[post("/create", data = "<server_input>")]
pub async fn create_server(
    guard: JwtGuard,
    server_input: Form<CreateServerInput>,
    aws_client: &State<Client>,
    mut db: Connection<database::HarmonyDb>,
    websocket_map_state: &rocket::State<SessionIdWebsocketMap>,
    server_map_state: &rocket::State<ServerSessionIdMap>,
    user_map_state: &rocket::State<UserSessionIdMap>,
) -> Result<Json<ServerChannel>, (Status, Json<ErrorResponse>)> {
    server_input
        .validate()
        .map_err(|_| (Status::BadRequest, json_error("Failed JSON validation")))?;

    let server_type: ServerType = server_input.server_type;
    let recipient_ids: &Vec<i32> = &server_input.recipient_ids;
    let server_name: &String = &server_input.server_name;
    let server_icon = &server_input.server_icon;
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

            // TODO: check if there already exists a dm with the recipient
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

    // put server icon into S3 bucket, if server_icon provided
    if let Some(server_icon) = &server_input.server_icon {
        upload_to_s3(
            aws_client,
            &server_icon.key,
            ByteStream::from(server_icon.data.value.clone()),
        )
        .await
        .map_err(|_| (Status::BadRequest, json_error("Server picture S3 failed")))?;
    }

    // make server
    let (server, channel) = create_server_helper(
        server_type,
        server_name,
        *user_id,
        server_icon.as_ref().map(|icon| &icon.key),
        &mut db,
    )
    .await?;
    let server_id: i32 = server.server_id;

    // make recipients + sender join server
    let mut combined_ids = Vec::new();
    combined_ids.extend(recipient_ids);
    combined_ids.push(*user_id);

    for id in combined_ids.iter() {
        join_server_helper(*id, server_id, &mut db, server_map_state, user_map_state).await?;
    }

    // broadcast server created websocket event
    let users = get_users_helper(server_id, &mut db).await?;
    let server_event = WebSocketEvent::ServerCreated(ServerCreated {
        server: server.clone(),
        channel: channel.clone(),
        users,
    });
    let message_json = serde_json::to_string(&server_event).map_err(|_| {
        (
            Status::InternalServerError,
            json_error("serialization error"),
        )
    })?;

    // broadcast server created to recipients + sender
    broadcast_to_users(
        &message_json,
        &combined_ids,
        websocket_map_state,
        user_map_state,
    )
    .await;

    Ok(Json(ServerChannel { server, channel }))
}

#[patch("/edit/<server_id>", data = "<server_input>")]
pub async fn edit_server(
    guard: JwtGuard,
    server_id: i32,
    server_input: Form<EditServerInput>,
    aws_client: &State<Client>,
    mut db: Connection<database::HarmonyDb>,
) -> Result<Json<Server>, (Status, Json<ErrorResponse>)> {
    server_input
        .validate()
        .map_err(|_| (Status::BadRequest, json_error("Failed JSON validation")))?;

    let server_name = &server_input.server_name;
    let server_icon = &server_input.server_icon;
    let user_id: &i32 = &guard.0.sub;

    is_admin(user_id, server_id, &mut db).await?;

    // change server_icon if provided
    if let Some(server_icon) = server_icon {
        upload_to_s3(
            aws_client,
            &server_icon.key,
            ByteStream::from(server_icon.data.value.clone()),
        )
        .await
        .map_err(|_| (Status::BadRequest, json_error("Server picture S3 failed")))?;

        let old_icon_key = sqlx::query_scalar!(
            "SELECT s3_icon_key FROM servers WHERE server_id = $1",
            server_id
        )
        .fetch_one(&mut **db)
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                json_error("Database error; does server_id exist?"),
            )
        })?;

        // if there was a previous icon, remove it from s3
        if let Some(old_icon_key) = old_icon_key {
            remove_from_s3(aws_client, &old_icon_key)
                .await
                .map_err(|_| (Status::BadRequest, json_error("Server picture S3 failed")))?;
        }

        sqlx::query!(
            r#"UPDATE servers
            SET s3_icon_key = $1
            WHERE server_id = $2
            "#,
            server_icon.key,
            server_id
        )
        .execute(&mut **db)
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                json_error("Database error; does server_id exist?"),
            )
        })?;
    };

    // change server_name if provided
    if let Some(server_name) = server_name {
        sqlx::query!(
            r#"UPDATE servers
            SET server_name = $1
            WHERE server_id = $2
            "#,
            server_name,
            server_id
        )
        .execute(&mut **db)
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                json_error("Database error; does server_id exist?"),
            )
        })?;
    };

    let server = sqlx::query_as!(
        Server,
        r#"SELECT
        server_id, server_type AS "server_type!: ServerType", members, server_name, admins, s3_icon_key
        FROM servers
        WHERE server_id = $1
        "#,
        server_id,
    )
    .fetch_one(&mut **db)
    .await
    .map_err(|_| {
        (
            Status::InternalServerError,
            json_error("Database error; does server_id exist?"),
        )
    })?;

    Ok(Json(server))
}

// TODO: move to utils?
async fn upload_to_s3(
    aws_client: &Client,
    key: &str,
    byte_stream: ByteStream,
) -> Result<(), aws_sdk_s3::Error> {
    let s3_bucket: String = dotenv::var("S3_IMAGE_BUCKET")
        .expect("set S3_IMAGE_BUCKET in .env")
        .parse::<String>()
        .unwrap();

    aws_client
        .put_object()
        .bucket(s3_bucket)
        .key(key)
        .body(byte_stream)
        .send()
        .await?;

    Ok(())
}

async fn remove_from_s3(aws_client: &Client, key: &str) -> Result<(), aws_sdk_s3::Error> {
    let s3_bucket: String = dotenv::var("S3_IMAGE_BUCKET")
        .expect("set S3_IMAGE_BUCKET in .env")
        .parse::<String>()
        .unwrap();

    aws_client
        .delete_object()
        .bucket(s3_bucket)
        .key(key)
        .send()
        .await?;

    Ok(())
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
    server_icon_key: Option<&String>,
    db: &mut Connection<database::HarmonyDb>,
) -> Result<(Server, Channel), (Status, Json<ErrorResponse>)> {
    // make server
    // num members initially 0, members will be incremented in join_server
    let server = sqlx::query_as!(
        models::Server,
        r#"INSERT INTO public.servers (server_type, members, server_name, admins, s3_icon_key)
        VALUES ($1, 0, $2, ARRAY[$3]::integer[], $4) 
        RETURNING server_id, server_type AS "server_type!: ServerType", members, server_name, admins, s3_icon_key"#,
        server_type as ServerType,
        server_name,
        user_id,
        server_icon_key
    )
    .fetch_one(&mut ***db)
    .await
    .map_err(|_| (Status::InternalServerError, json_error("Database error")))?;
    let server_id: i32 = server.server_id;

    let channel = create_channel_helper(server_id, "general", db).await?;

    Ok((server, channel))
}
async fn join_server_helper(
    user_id: i32,
    server_id: i32,
    db: &mut Connection<database::HarmonyDb>,
    server_map_state: &rocket::State<ServerSessionIdMap>,
    user_map_state: &rocket::State<UserSessionIdMap>,
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

    // add user_id's session_ids to the server websocket map
    add_user_to_server_map(user_id, server_id, server_map_state, user_map_state).await;

    Ok(())
}

#[delete("/delete/<server_id>")]
pub async fn delete_server(
    guard: JwtGuard,
    server_id: i32,
    mut db: Connection<database::HarmonyDb>,
) -> Result<(), (Status, Json<ErrorResponse>)> {
    let user_id = &guard.0.sub;

    is_admin(user_id, server_id, &mut db).await?;

    // delete server
    sqlx::query!("DELETE FROM servers WHERE server_id = $1", server_id)
        .execute(&mut **db)
        .await
        .map_err(|_| (Status::BadRequest, json_error("Database error")))?;

    Ok(())
}

// check if user is admin of the server
async fn is_admin(
    user_id: &i32,
    server_id: i32,
    db: &mut Connection<database::HarmonyDb>,
) -> Result<(), (Status, Json<ErrorResponse>)> {
    // check if user is admin of the server
    let admins = sqlx::query_scalar!("SELECT admins FROM servers WHERE server_id = $1", server_id)
        .fetch_one(&mut ***db)
        .await
        .map_err(|_| {
            (
                Status::BadRequest,
                json_error("Database error. Does server_id exist?"),
            )
        })?;

    if !admins.contains(user_id) {
        return Err((
            Status::Unauthorized,
            json_error("User is not admin in this server"),
        ));
    };
    Ok(())
}

#[delete("/leave/<server_id>")]
pub async fn leave_server(
    guard: JwtGuard,
    server_id: i32,
    mut db: Connection<database::HarmonyDb>,
) -> Result<(), (Status, Json<ErrorResponse>)> {
    let user_id = &guard.0.sub;

    // leave server
    sqlx::query!(
        "DELETE FROM users_servers
        WHERE server_id = $1 AND user_id = $2",
        server_id,
        user_id
    )
    .execute(&mut **db)
    .await
    .map_err(|_| {
        (
            Status::BadRequest,
            json_error("Database error. Does server_id exist?"),
        )
    })?;

    // decrement users
    sqlx::query!(
        "UPDATE servers
        SET members = members - 1
        WHERE server_id = $1",
        server_id
    )
    .execute(&mut **db)
    .await
    .map_err(|_| {
        (
            Status::BadRequest,
            json_error("Database error. Does server_id exist?"),
        )
    })?;

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
