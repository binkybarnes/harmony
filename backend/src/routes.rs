use crate::controllers::{self, websockets};

use rocket::{Build, Rocket};

pub fn build() -> Rocket<Build> {
    let port: u16 = dotenv::var("ROCKET_PORT")
        .expect("set PORT in .env")
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
                controllers::server_routes::join_server,
                controllers::server_routes::create_server,
                controllers::server_routes::get_channels_list,
                controllers::server_routes::get_users_list,
                controllers::server_routes::get_users,
            ],
        )
        .mount("/", routes![controllers::websockets::websocket_handler])
    // .mount(
    //     "/api/channels",
    //     routes![controllers::channel_routes::get_channels],
    // )
    // .mount(
    //     "/api/users",
    //     routes![controllers::users_routes::get_users_list],
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
