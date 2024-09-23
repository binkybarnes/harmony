use crate::models::{ServerSessionIdMap, SessionIdWebsocketMap};
use rocket::futures::SinkExt;

// websocket: broadcasts given message to everyone in the server
pub async fn broadcast_ws_message(
    message: &str,
    server_id: i32,
    websocket_map_state: &rocket::State<SessionIdWebsocketMap>,
    server_map_state: &rocket::State<ServerSessionIdMap>,
) {
    let websocket_map_state = websocket_map_state.inner().clone();
    let server_map_state = server_map_state.inner().clone();
    {
        let websocket_map = websocket_map_state.lock().await;
        let server_map = server_map_state.lock().await;

        if let Some(arc_mutex_vec) = server_map.get(&server_id) {
            let senders_session_id = arc_mutex_vec.lock().await;
            for sender_session_id in senders_session_id.iter() {
                if let Some(sender_arc_mutex) = websocket_map.get(sender_session_id) {
                    let mut sender = sender_arc_mutex.lock().await;
                    if let Err(e) = sender.send(message.into()).await {
                        eprintln!("Error sending message: {:?}", e);
                    }
                } else {
                    println!(
                        "No WebSocket sender found for session ID: {:?}",
                        sender_session_id
                    );
                }
            }
        } else {
            println!("No session IDs found for server ID: {:?}", server_id);
        }
    }
}
