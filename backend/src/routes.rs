use crate::controllers;
use rocket::{Build, Rocket};

pub fn build() -> Rocket<Build> {
    dotenv::from_filename("../.env").ok();
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
}
