use middleware::cors;
use models::new_channel_map;
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
    let _ = dotenv::dotenv().ok();
    let channels = new_channel_map();
    routes::build()
        .attach(database::HarmonyDb::init())
        .attach(cors::Cors)
        .manage(channels)
        .register("/", catchers![not_authorized])
        .mount("/", routes![index])
}
