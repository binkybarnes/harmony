use crate::controllers;

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
            routes![controllers::server_routes::get_servers],
        )
}

// .mount(
//     "/api/messages",
//     routes![
//         controllers::message_routes::signup,
//         controllers::auth_routes::login,
//         controllers::auth_routes::logout
//     ],
// )
