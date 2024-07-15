use rocket_db_pools::Database;

#[macro_use]
extern crate rocket;

mod controllers;
mod database;
mod models;
mod routes;

mod utils;

// #[derive(Database)]
// #[database("harmony_db")]
// struct HarmonyDb(sqlx::PgPool);

struct Name(String);

#[get("/")]
async fn index() -> &'static str {
    "bingus"
}

#[launch]
fn rocket() -> _ {
    use validator::Validate;
    let x = models::UserSignupInput {
        email: "bruh",
        username: "stink",
        password: "aomg",
        confirm_password: "jfdsjfids",
    };
    match x.validate() {
        Ok(_) => println!("Validation passed."),
        Err(e) => println!("Validation failed: {:?}", e),
    }
    print!("AAAAAAA{}", x.email);
    routes::build()
        .attach(database::HarmonyDb::init())
        .mount("/", routes![index])
}
