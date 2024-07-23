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

#[derive(Serialize)]
pub struct DefaultResponse {
    pub id: i32,
    pub username: String,
    pub profile_picture: String,
}

#[derive(Deserialize)]
pub struct UserLoginInput<'r> {
    pub username: &'r str,
    pub password: &'r str,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    error: String,
}
