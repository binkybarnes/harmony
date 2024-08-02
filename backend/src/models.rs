// use rocket::serde::{json::Json, Deserialize, Serialize};
use once_cell::sync::Lazy;
use regex::Regex;
use rocket::serde::{Deserialize, Serialize};

use validator::{Validate, ValidationError};

static ALPHA_NUM: Lazy<Regex> = Lazy::new(|| Regex::new(r"^[a-zA-Z0-9_ඞ]+$").unwrap());

#[derive(Deserialize, Validate)]
pub struct UserSignupInput<'r> {
    // email, username, password, confirmPassword
    #[validate(email)]
    pub email: &'r str,
    #[validate(length(min = 1, max = 15), regex(path = *ALPHA_NUM))]
    pub username: &'r str,
    #[validate(length(min = 1, max = 20))]
    pub password: &'r str,
    #[validate(length(min = 1, max = 20))]
    pub confirm_password: &'r str,
}

#[derive(Deserialize)]
pub struct UserLoginInput<'r> {
    pub username: &'r str,
    pub password: &'r str,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub user_id: i32,
    pub username: String,
    pub profile_picture: String,
}

// #[derive(Serialize)]
// pub struct ErrorResponse {
//     error: String,
// }

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: i32,
    pub iat: usize, // Optional. Issued at (as UTC timestamp)
    pub exp: usize, // Required (validate_exp defaults to true in validation). Expiration time (as UTC timestamp)
}

#[derive(Deserialize)]
pub struct MessageInput<'r> {
    pub channel_id: i32,
    pub message: &'r str,
}

#[derive(Serialize)]
pub struct MessageResponse<'r> {
    pub user_id: i32,
    pub channel_id: i32,
    pub message: &'r str,
}
