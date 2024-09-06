use middleware::cors;
use models::{new_online_users, OnlineUsers};
use rocket_db_pools::Database;
use utils::error_catchers::not_authorized;

#[macro_use]
extern crate rocket;

mod database;
mod models;
mod routes;

mod controllers;
mod middleware;
mod utils;

// #[derive(Database)]
// #[database("harmony_db")]
// struct HarmonyDb(sqlx::PgPool);

#[get("/")]
async fn index() -> &'static str {
    "bingus"
}

#[launch]
fn rocket() -> _ {
    // Create a shared set of online users
    let online_users: OnlineUsers = new_online_users();

    let _ = dotenv::dotenv().ok();
    routes::build()
        .attach(database::HarmonyDb::init())
        .attach(cors::Cors)
        .manage(online_users)
        .register("/", catchers![not_authorized])
        .mount("/", routes![index])
}
