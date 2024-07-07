use dotenv;

#[macro_use]
extern crate rocket;

mod controllers;
mod routes;

#[get("/")]
fn index() -> &'static str {
    "bingus"
}

#[launch]
fn rocket() -> _ {
    dotenv::from_filename("../.env").ok();
    let port: u16 = dotenv::var("PORT")
        .expect("set PORT in .env")
        .parse::<u16>()
        .unwrap();
    print!("{}", port);
    // rocket::build().mount("/", routes![index])
    routes::build()
}
