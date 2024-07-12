// use rocket::serde::{json::Json, Deserialize, Serialize};
use rocket::serde::{Deserialize, Serialize};
use validator::{Validate, ValidationError};

#[derive(Deserialize, Validate)]
pub struct UserSignupInput<'r> {
    // email, username, password, confirmPassword
    #[validate(email)]
    pub email: &'r str,
    #[validate(length(min = 1, max = 15))]
    pub username: &'r str,
    #[validate(length(min = 1, max = 20))]
    pub password: &'r str,
    #[validate(length(min = 1, max = 20))]
    pub confirm_password: &'r str,
}

#[derive(Serialize)]
pub struct SignupResponse {
    pub id: i64,
    pub username: String,
    pub profile_picture: String,
}
