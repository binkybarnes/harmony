use rocket::{futures::StreamExt, get, routes};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use ws::stream::DuplexStream;
use ws::{Channel, WebSocket};

use crate::models::StreamMap;

// the name channels is referring to the channels in my servers, not the rocket channel
#[get("/ws/<channel_id>")]
pub fn websocket_handler(
    ws: WebSocket,
    channel_id: i32,
    state: &rocket::State<StreamMap>,
) -> Channel<'static> {
    let state = state.inner().clone();

    ws.channel(move |stream| {
        let state = state.clone();
        let (sender, mut receiver) = stream.split();
        let sender = Arc::new(Mutex::new(sender));

        Box::pin(async move {
            println!("User connected to channel {}", channel_id);

            // Add the new sender to the stream map
            {
                let mut channels = state.lock().await;
                let channel_senders = channels.entry(channel_id).or_insert_with(Vec::new);
                channel_senders.push(sender.clone());
            }

            // Process incoming messages
            tokio::spawn(async move {
                while let Some(message) = receiver.next().await {
                    match message {
                        Ok(msg) => {
                            println!("Received message in channel {}: {:?}", channel_id, msg);
                        }
                        Err(e) => {
                            println!("Error in channel {}: {:?}", channel_id, e);
                        }
                    }
                }

                // Handle disconnection
                println!("User disconnected from channel {}", channel_id);

                // Remove the sender from the stream map
                {
                    let mut channels = state.lock().await;
                    if let Some(channel_senders) = channels.get_mut(&channel_id) {
                        if let Some(pos) =
                            channel_senders.iter().position(|s| Arc::ptr_eq(s, &sender))
                        {
                            channel_senders.remove(pos);
                            println!(
                                "Sender removed from channel {}. Remaining senders: {}",
                                channel_id,
                                channel_senders.len()
                            );

                            // Remove the channel entry if it has no senders left
                            if channel_senders.is_empty() {
                                channels.remove(&channel_id);
                                println!(
                                    "Channel {} removed as it has no more senders.",
                                    channel_id
                                );
                            }
                        }
                    }
                }
            });

            Ok(())
        })
    })
}

pub async fn print_stream_map(stream_map: &rocket::State<StreamMap>) {
    // Lock the Mutex to access the HashMap
    let channels = stream_map.lock().await;

    // Check if the HashMap is empty
    if channels.is_empty() {
        println!("The StreamMap is empty.");
        return;
    }

    // Iterate through the HashMap and print each entry
    for (channel_id, streams) in channels.iter() {
        println!("Channel ID: {}", channel_id);
        println!("Number of connected streams: {}", streams.len());

        // Optionally print details of each stream
        for (index, _stream) in streams.iter().enumerate() {
            // Streams are DuplexStream, which are not directly printable
            println!(
                "  Stream {}: (details are not directly printable)",
                index + 1
            );
        }
    }
}
