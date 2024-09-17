use crate::database::HarmonyDb;
use crate::middleware::protect_route::JwtGuard;
use crate::models::ErrorResponse;
use crate::models::Server;
use crate::models::ServerType;
use crate::models::{ServerSessionIdMap, SessionIdWebsocketMap};
use crate::utils::json_error::json_error;
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::{futures::StreamExt, get, routes};
use rocket_db_pools::Connection;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;
use ws::stream::DuplexStream;
use ws::{Channel, WebSocket};

// the name channel_id is referring to the channels in my servers, not the rocket channel
#[get("/chat_ws/<user_id>")]
pub async fn websocket_handler(
    ws: WebSocket,
    user_id: i32,
    websocket_map_state: &rocket::State<SessionIdWebsocketMap>,
    server_map_state: &rocket::State<ServerSessionIdMap>,
    mut db: Connection<HarmonyDb>,
) -> Channel<'static> {
    let session_id = Uuid::new_v4();
    let websocket_map_state = websocket_map_state.inner().clone();
    let server_map_state = server_map_state.inner().clone();

    let servers = get_all_servers(user_id, &mut db).await.unwrap();

    ws.channel(move |stream| {
        let (sender, mut receiver) = stream.split();
        let sender = Arc::new(Mutex::new(sender));

        Box::pin(async move {
            println!("User connected");

            // map session_id to websocket sender
            {
                let mut websocket_map = websocket_map_state.lock().await;
                websocket_map.insert(session_id, sender);
            }
            // add the websocket sender to every server the user is in
            {
                let mut server_map = server_map_state.lock().await;
                for server in servers.iter() {
                    let entry = server_map
                        .entry(server.server_id)
                        .or_insert_with(|| Arc::new(Mutex::new(Vec::new())));
                    let mut vec = entry.lock().await;
                    vec.push(session_id);
                }
            }

            // Process incoming messages
            tokio::spawn(async move {
                while let Some(message) = receiver.next().await {
                    match message {
                        Ok(msg) => {
                            println!("Received message{:?}", msg);
                        }
                        Err(e) => {
                            println!("Error in channel {:?}", e);
                        }
                    }
                }

                // Handle disconnection
                println!("User disconnected");

                // Remove session_id from websocket map
                {
                    let mut websocket_map = websocket_map_state.lock().await;
                    websocket_map.remove(&session_id);
                }
                // remove session_id from server map
                {
                    let server_map = server_map_state.lock().await;
                    for server in servers.iter() {
                        if let Some(arc_mutex_vec) = server_map.get(&server.server_id) {
                            let mut vec = arc_mutex_vec.lock().await;
                            vec.retain(|id| *id != session_id);
                        }
                    }
                }
            });

            Ok(())
        })
    })
}

async fn get_all_servers(
    user_id: i32,
    db: &mut Connection<HarmonyDb>,
) -> Result<Vec<Server>, (Status, Json<ErrorResponse>)> {
    let servers = sqlx::query_as!(
        Server,
        r#"SELECT 
        s.server_id, s.server_type AS "server_type!: ServerType", members, server_name, admins
        FROM servers s
        JOIN users_servers us ON us.server_id = s.server_id
        WHERE us.user_id = $1"#,
        user_id,
    )
    .fetch_all(&mut ***db)
    .await
    .map_err(|_| (Status::BadRequest, json_error("Database error")))?;

    Ok(servers)
}

// pub async fn print_stream_map(stream_map: &rocket::State<UserStreamMap>) {
//     // Lock the Mutex to access the HashMap
//     let channels = stream_map.lock().await;

//     // Check if the HashMap is empty
//     if channels.is_empty() {
//         println!("The StreamMap is empty.");
//         return;
//     }

//     // Iterate through the HashMap and print each entry
//     for (channel_id, streams) in channels.iter() {
//         println!("Channel ID: {}", channel_id);
//         println!("Number of connected streams: {}", streams.len());

//         // Optionally print details of each stream
//         for (index, _stream) in streams.iter().enumerate() {
//             // Streams are DuplexStream, which are not directly printable
//             println!(
//                 "  Stream {}: (details are not directly printable)",
//                 index + 1
//             );
//         }
//     }
// }
