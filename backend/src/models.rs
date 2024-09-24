use aws_sdk_s3::presigning::PresigningConfig;
use aws_sdk_s3::primitives::ByteStream;
// use rocket::serde::{json::Json, Deserialize, Serialize};
use once_cell::sync::Lazy;
use regex::Regex;
use rocket::data::{Capped, ToByteUnit};
use rocket::form::{self, DataField, Form, FromFormField};
use rocket::fs::TempFile;
use rocket::serde::{Deserialize, Serialize};

use uuid::Uuid;
use validator::{Validate, ValidationError};

use chrono::{DateTime, NaiveDate, Utc};

#[derive(Serialize, Debug)]
pub struct ErrorResponse {
    pub error: String,
}

static ALPHA_NUM: Lazy<Regex> = Lazy::new(|| Regex::new(r"^[a-zA-Z0-9_ඞ]+$").unwrap());

#[derive(Deserialize, Validate)]
pub struct UserSignupInput<'r> {
    // email, username, password, confirmPassword
    #[validate(email)]
    pub email: &'r str,
    #[validate(length(min = 1, max = 15), regex(path = *ALPHA_NUM))]
    pub username: &'r str,
    #[validate(length(min = 1, max = 20))]
    pub password: &'r str,
    #[validate(length(min = 1, max = 20))]
    pub confirm_password: &'r str,
}

#[derive(Deserialize)]
pub struct UserLoginInput<'r> {
    pub username: &'r str,
    pub password: &'r str,
}

#[derive(Serialize)]
pub struct User {
    pub user_id: i32,
    pub display_username: String,
    pub profile_picture: String,
    pub date_joined: NaiveDate,
}

// #[derive(Serialize)]
// pub struct ErrorResponse {
//     error: String,
// }

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: i32,
    pub iat: usize, // Optional. Issued at (as UTC timestamp)
    pub exp: usize, // Required (validate_exp defaults to true in validation). Expiration time (as UTC timestamp)
}

#[derive(Deserialize)]
pub struct SendMessageInput {
    pub channel_id: i32,
    pub server_id: i32,
    pub message: String,
    pub display_username: String,
    pub profile_picture: String,
}

#[derive(Deserialize)]
pub struct GetMessagesInput {
    pub channel_id: i32,
}

#[derive(Serialize, Clone)]
pub struct Message {
    pub message_id: i64,
    pub user_id: i32,
    pub channel_id: i32,
    pub message: String,
    pub timestamp: DateTime<Utc>,
    pub display_username: String,
    pub profile_picture: String,
}

// #[derive(Deserialize)]
// pub struct GetServersInput<'r> {
//     pub server_type: &'r str,
// }

#[derive(sqlx::Type, Deserialize, Serialize, FromFormField, Clone, Copy)]
#[sqlx(type_name = "server_type", rename_all = "lowercase")]
pub enum ServerType {
    Dm,
    GroupChat,
    Server,
}

// for sqlx queries
#[derive(Serialize)]
pub struct Server {
    pub server_id: i32,
    pub server_type: ServerType,
    pub members: i32,
    pub server_name: String,
    pub admins: Vec<i32>,
    pub s3_icon_key: Option<String>,
}

#[derive(Serialize)]
pub struct Channel {
    pub channel_id: i32,
    pub server_id: i32,
    pub channel_name: String,
}

// #[derive(Deserialize, Validate)]
// pub struct CreateServerInput {
//     pub recipient_ids: Vec<i32>,
//     pub server_type: ServerType,
//     #[validate(length(min = 1, max = 30))]
//     pub server_name: String,
// }

pub struct S3File {
    pub key: String,
    pub data: Capped<Vec<u8>>,
}

#[rocket::async_trait]
impl<'r> FromFormField<'r> for S3File {
    async fn from_data(field: DataField<'r, '_>) -> form::Result<'r, Self> {
        let file_name = format!("server-profile-pictures/{}", Uuid::new_v4());
        let bytes = field.data.open(1.mebibytes()).into_bytes().await?;

        Ok(S3File {
            key: file_name,
            data: bytes,
        })
    }
}

#[derive(FromForm, Validate)]
pub struct CreateServerInput {
    pub recipient_ids: Vec<i32>,
    pub server_type: ServerType,
    #[validate(length(min = 1, max = 30))]
    pub server_name: String,
    pub server_icon: Option<S3File>,
}

#[derive(Serialize)]
pub struct ServerChannel {
    pub server: Server,
    // default channel
    pub channel: Channel,
}

#[derive(Serialize)]
pub struct OptionalServerChannel {
    pub server: Option<Server>,
    // default channel
    pub channel: Option<Channel>,
}

#[derive(FromForm, Validate)]
pub struct EditServerInput {
    #[validate(length(min = 1, max = 30))]
    pub server_name: Option<String>,
    pub server_icon: Option<S3File>,
}

#[derive(Deserialize)]
pub struct ServerIds {
    pub server_ids: Vec<i32>,
}

#[derive(Deserialize, Validate)]
pub struct CreateChannelInput {
    pub server_id: i32,
    #[validate(length(min = 1, max = 30))]
    pub channel_name: String,
}
// websocket stuff

use rocket::futures::stream::SplitSink;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use ws::{stream::DuplexStream, Message as WsMessage};

// maps channel_id to list of websocket send connections
pub type SessionIdWebsocketMap =
    Arc<Mutex<HashMap<Uuid, Arc<Mutex<SplitSink<DuplexStream, WsMessage>>>>>>;
pub fn new_sessionid_websocket_map() -> SessionIdWebsocketMap {
    Arc::new(Mutex::new(HashMap::new()))
}

// map server_id to list of session_ids
pub type ServerSessionIdMap = Arc<Mutex<HashMap<i32, Arc<Mutex<Vec<Uuid>>>>>>;
pub fn new_server_sessionid_map() -> ServerSessionIdMap {
    Arc::new(Mutex::new(HashMap::new()))
}

// websocket events
#[derive(Serialize)]
#[serde(tag = "event_type", content = "data")]
pub enum WebSocketEvent {
    Message(Message),
    UserJoin(UserJoin),
}

#[derive(Serialize)]
pub struct UserJoin {
    pub user: User,
    pub server_id: i32,
}

// #[derive(Deserialize)]
// pub struct ChatWSInput {
//     pub user_id: i32,
//     pub channel_id: i32,
// }

// #[derive(Deserialize)]
// pub struct UpdateChannelInput {
//     pub user_id: i32,
//     pub prev_channel_id: i32,
//     pub new_channel_id: i32,
// }
