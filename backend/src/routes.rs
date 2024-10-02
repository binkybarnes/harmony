use crate::controllers::{self};

use rocket::{Build, Rocket};

pub fn build() -> Rocket<Build> {
    let port: u16 = dotenv::var("ROCKET_PORT")
        .expect("set ROCKET_PORT in .env")
        .parse::<u16>()
        .unwrap();

    rocket::build()
        .configure(rocket::Config::figment().merge(("port", port)))
        .mount(
            "/api/auth",
            routes![
                controllers::auth_routes::signup,
                controllers::auth_routes::login,
                controllers::auth_routes::logout
            ],
        )
        .mount(
            "/api/messages",
            routes![
                controllers::message_routes::send_message,
                controllers::message_routes::get_messages
            ],
        )
        .mount(
            "/api/servers",
            routes![
                controllers::server_routes::get_servers,
                controllers::server_routes::get_dm,
                controllers::server_routes::get_servers_popular,
                controllers::server_routes::search_servers_name,
                controllers::server_routes::search_servers_id,
                controllers::server_routes::join_server,
                controllers::server_routes::create_server,
                controllers::server_routes::delete_server,
                controllers::server_routes::edit_server,
                controllers::server_routes::leave_server,
                controllers::server_routes::create_channel,
                controllers::server_routes::get_channels_list,
                controllers::server_routes::get_channels,
                controllers::server_routes::get_users_list,
                controllers::server_routes::get_users,
            ],
        )
        .mount("/api/users", routes![controllers::users_routes::edit_user])
        .mount("/ws", routes![controllers::websockets::websocket_handler])
    // .mount(
    //     "/api/channels",
    //     routes![controllers::channel_routes::get_channels],
    // )
}

// .mount(
//     "/api/messages",
//     routes![
//         controllers::message_routes::signup,
//         controllers::auth_routes::login,
//         controllers::auth_routes::logout
//     ],
// )
