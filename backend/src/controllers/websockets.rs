use rocket::futures::{SinkExt, StreamExt};
use rocket::serde::json::serde_json;
use rocket::{get, routes, Request, State};

use crate::models::{OnlineUsers, OnlineUsersResponse};
use ws::{Channel, WebSocket};

#[get("/chat/<user_id>")]
pub fn chat(ws: WebSocket, users: &State<OnlineUsers>, user_id: i32) -> Channel<'static> {
    let users = users.inner().clone();
    users.lock().unwrap().insert(user_id);

    println!("User connected: {}", user_id);
    println!("Current online users: {:?}", users.lock().unwrap());

    ws.channel(move |mut stream| {
        Box::pin(async move {
            // send online_users
            let online_users_list = {
                let users = users.lock().unwrap();
                // Serialize the underlying HashSet
                let response = OnlineUsersResponse {
                    users: users.clone(),
                };
                serde_json::to_string(&response).unwrap() // Convert to JSON string
            };
            let _ = stream.send(ws::Message::Text(online_users_list)).await;

            while let Some(message) = stream.next().await {
                let _ = stream.send(message?).await;
            }

            // remove user when disconnected
            users.lock().unwrap().remove(&user_id);
            println!("User disconnected: {}", user_id);
            println!("Current online users: {:?}", users.lock().unwrap());

            Ok(())
        })
    })
}
