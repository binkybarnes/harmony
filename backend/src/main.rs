use middleware::cors;
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
    routes::build()
        .attach(database::HarmonyDb::init())
        .attach(cors::Cors)
        .register("/", catchers![not_authorized])
        .mount("/", routes![index])
}
