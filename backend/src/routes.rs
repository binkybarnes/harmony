use crate::controllers;
use rocket::Rocket;

pub fn build() -> Rocket<rocket::Build> {
    rocket::build().mount("/api/auth", routes![controllers::auth_routes::signup])
}
