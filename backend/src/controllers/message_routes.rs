use crate::middleware::protect_route::JwtGuard;
use rocket::response::Responder;

#[post("/send/<user_id>")]
pub async fn send_message(_guard: JwtGuard, user_id: i64) {
    // json input:
    // email, username, password, confirmPassword
    // json inserted:
    // email, username, password, profile_picture
    // json returned:
    // id, username, profile_picture

    print!("bingus {}", user_id);
}
