use aws_sdk_s3::Client;
use middleware::cors;
use models::{new_server_sessionid_map, new_sessionid_websocket_map, new_user_sessionid_map};
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
async fn rocket() -> _ {
    let _ = dotenv::dotenv().ok();
    let websocket_map = new_sessionid_websocket_map();
    let server_map = new_server_sessionid_map();
    let user_map = new_user_sessionid_map();

    let config = aws_config::load_from_env().await;
    let aws_client = Client::new(&config);
    // let response = aws_client.list_buckets().send().await.unwrap();
    // // Print the list of buckets
    // println!("Buckets: {:?}", response.buckets);

    routes::build()
        .attach(database::HarmonyDb::init())
        .attach(cors::Cors)
        .manage(websocket_map)
        .manage(server_map)
        .manage(user_map)
        .manage(aws_client)
        .register("/", catchers![not_authorized])
        .mount("/", routes![index])
}
