use crate::database::HarmonyDb;
use crate::models::print_server_sessionid_map;
use crate::models::ErrorResponse;
use crate::models::Server;
use crate::models::ServerType;
use crate::models::UserSessionIdMap;
use crate::models::WebRTCWebSocketEvent;
use crate::models::WebSocketEvent;
use crate::models::{ServerSessionIdMap, SessionIdWebsocketMap};
use crate::utils::broadcast_ws_message::broadcast_to_user;
use crate::utils::json_error::json_error;
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::{futures::StreamExt, get};
use rocket_db_pools::Connection;
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;
use ws::{Channel, WebSocket};

// the name channel_id is referring to the channels in my servers, not the rocket channel
#[get("/chat_ws/<user_id>")]
pub async fn websocket_handler(
    ws: WebSocket,
    user_id: i32,
    websocket_map_state: &rocket::State<SessionIdWebsocketMap>,
    server_map_state: &rocket::State<ServerSessionIdMap>,
    user_map_state: &rocket::State<UserSessionIdMap>,
    mut db: Connection<HarmonyDb>,
) -> Channel<'static> {
    let session_id = Uuid::new_v4();
    let websocket_map = websocket_map_state.inner().clone();
    let server_map = server_map_state.0.clone();
    let user_map = user_map_state.0.clone();

    let servers = get_all_servers(user_id, &mut db).await.unwrap();

    ws.channel(move |stream| {
        let (sender, mut receiver) = stream.split();
        let sender = Arc::new(Mutex::new(sender));

        Box::pin(async move {
            println!("User connected");

            // map session_id to websocket sender
            {
                let mut websocket_map = websocket_map.lock().await;
                websocket_map.insert(session_id, sender);
            }
            // add the websocket sender to every server the user is in
            {
                let mut server_map = server_map.lock().await;
                for server in servers.iter() {
                    let entry = server_map
                        .entry(server.server_id)
                        .or_insert_with(|| Arc::new(Mutex::new(Vec::new())));
                    let mut vec = entry.lock().await;
                    vec.push(session_id);
                }
            }
            // add session_id to user bucket
            {
                let mut user_map = user_map.lock().await;
                let entry = user_map
                    .entry(user_id)
                    .or_insert_with(|| Arc::new(Mutex::new(Vec::new())));
                let mut vec = entry.lock().await;
                vec.push(session_id);
            }

            // TODO:  what the sigma is this for?
            // Process incoming messages
            tokio::spawn(async move {
                while let Some(message) = receiver.next().await {
                    println!("rat");
                    match message {
                        Ok(msg) => {
                            if let Ok(ws_msg) =
                                serde_json::from_str::<WebRTCWebSocketEvent>(&msg.to_string())
                            {
                                match ws_msg {
                                    WebRTCWebSocketEvent::Offer { sdp, to, from } => {
                                        // Forward SDP offer to the recipient
                                        let offer =
                                            serde_json::to_string(&WebRTCWebSocketEvent::Offer {
                                                sdp,
                                                to,
                                                from,
                                            })
                                            .unwrap();
                                        broadcast_to_user(
                                            &offer,
                                            to,
                                            websocket_map.clone(),
                                            UserSessionIdMap(user_map.clone()),
                                        )
                                        .await;
                                    }
                                    WebRTCWebSocketEvent::Answer { sdp, to, from } => {
                                        // Forward SDP answer to the caller
                                        let answer =
                                            serde_json::to_string(&WebRTCWebSocketEvent::Answer {
                                                sdp,
                                                to,
                                                from,
                                            })
                                            .unwrap();
                                        broadcast_to_user(
                                            &answer,
                                            to,
                                            websocket_map.clone(),
                                            UserSessionIdMap(user_map.clone()),
                                        )
                                        .await;
                                    }
                                    WebRTCWebSocketEvent::IceCandidate {
                                        candidate,
                                        sdp_mid,
                                        sdp_mline_index,
                                        to,
                                        from,
                                    } => {
                                        // Forward ICE candidate to the peer
                                        let ice_msg = serde_json::to_string(
                                            &WebRTCWebSocketEvent::IceCandidate {
                                                candidate,
                                                sdp_mid,
                                                sdp_mline_index,
                                                to,
                                                from,
                                            },
                                        )
                                        .unwrap();
                                        broadcast_to_user(
                                            &ice_msg,
                                            to,
                                            websocket_map.clone(),
                                            UserSessionIdMap(user_map.clone()),
                                        )
                                        .await;
                                    }
                                }
                            }
                        }
                        Err(e) => {
                            println!("Error in channel {:?}", e);
                        }
                    }
                }

                // Handle disconnection
                println!("User disconnected");
                // print_server_sessionid_map(server_map_state.clone()).await;
                // Remove session_id from websocket map
                {
                    let mut websocket_map = websocket_map.lock().await;
                    websocket_map.remove(&session_id);
                }
                // remove session_id from server map
                {
                    for server in servers.iter() {
                        let arc_mutex_vec = {
                            let server_map = server_map.lock().await;
                            server_map.get(&server.server_id).cloned()
                        };

                        if let Some(arc_mutex_vec) = arc_mutex_vec {
                            let mut vec = arc_mutex_vec.lock().await;
                            vec.retain(|id| *id != session_id);

                            if vec.is_empty() {
                                let mut server_map = server_map.lock().await;
                                server_map.remove(&server.server_id);
                            }
                        }
                    }
                }
                // remove session_id from user map
                {
                    let arc_mutex_vec = {
                        let user_map = user_map.lock().await;
                        user_map.get(&user_id).cloned()
                    };

                    if let Some(arc_mutex_vec) = arc_mutex_vec {
                        let mut vec = arc_mutex_vec.lock().await;
                        vec.retain(|id| *id != session_id);
                        if vec.is_empty() {
                            let mut user_map = user_map.lock().await;
                            user_map.remove(&user_id);
                        }
                    }
                }
                // println!("\n\n");
                // print_server_sessionid_map(server_map_state.clone()).await;
            });

            Ok(())
        })
    })
}

// add user_id's session_ids to the server websocket map
pub async fn add_user_to_server_map(
    user_id: i32,
    server_id: i32,
    server_map_state: &rocket::State<ServerSessionIdMap>,
    user_map_state: &rocket::State<UserSessionIdMap>,
) {
    let server_map_state = server_map_state.0.clone();
    let user_map_state = user_map_state.0.clone();

    // add every session_id of user_id to the server map
    {
        let mut server_map = server_map_state.lock().await;
        let mut user_map = user_map_state.lock().await;
        let entry = user_map
            .entry(user_id)
            .or_insert_with(|| Arc::new(Mutex::new(Vec::new())));
        let user_session_ids = entry.lock().await;
        for user_session_id in user_session_ids.iter() {
            let entry = server_map
                .entry(server_id)
                .or_insert_with(|| Arc::new(Mutex::new(Vec::new())));
            let mut server_session_ids = entry.lock().await;
            server_session_ids.push(*user_session_id);
        }
    }
}

// maybe? remove user_id's session_ids to the server websocket map

// todo: move this somewhere else
async fn get_all_servers(
    user_id: i32,
    db: &mut Connection<HarmonyDb>,
) -> Result<Vec<Server>, (Status, Json<ErrorResponse>)> {
    let servers = sqlx::query_as!(
        Server,
        r#"SELECT 
        s.server_id, s.server_type AS "server_type!: ServerType", members, server_name, admins, s3_icon_key, last_message_at, last_message_id
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
