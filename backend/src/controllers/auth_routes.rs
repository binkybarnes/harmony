use crate::database;
use crate::models;

use crate::utils::{generate_token, json_error::json_error};
use rocket::http::{Cookie, CookieJar, Status};
use rocket::serde::{json::Json, Deserialize, Serialize};
use rocket::{
    response::{self, status::Created, Debug, Responder},
    Request,
};
use rocket_db_pools::Connection;
use validator::{Validate, ValidationErrors};

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};

// type Result<T, E = CustomError> = std::result::Result<T, E>;

// pub enum BadRequestError {
//     BadRequest(status::BadRequest<&'static str>),
// }

// #[derive(Responder)]
// pub enum InternalError {
//     #[response(status = 400, content_type = "json")]
//     ValidationFailed(String),
//     DatabaseError(rocket_db_pools::sqlx::Error),
// }

// impl From<ValidationErrors> for CustomError {
//     fn from(error: ValidationErrors) -> Self {
//         CustomError::ValidationFailed(error)
//     }
// }
// impl From<sqlx::Error> for CustomError {
//     fn from(error: rocket_db_pools::sqlx::Error) -> Self {
//         CustomError::DatabaseError(error)
//     }
// }

// impl<'r> Responder<'r, 'r> for CustomError {
//     fn respond_to(self, _: &Request) -> response::Result<'r> {
//         Err(Status::InternalServerError)
//     }
// }

// #[derive(Responder)]
// pub enum CustomResponse {
//     #[response(status = 200, content_type = "json")]
//     Approved(Json<i64>),
//     #[response(status = 400, content_type = "json")]
//     BadRequest(String),
//     #[response(status = 500, content_type = "json")]
//     InternalServerError(String),
// }

// pub enum CustomError {}

#[post("/signup", format = "json", data = "<user>")]
pub async fn signup<'a>(
    user: Json<models::UserSignupInput<'_>>,
    mut db: Connection<database::HarmonyDb>,
    jar: &'a CookieJar<'_>,
) -> impl Responder<'a, 'a> {
    // json input:
    // email, username, password, confirmPassword
    // json inserted:
    // email, username, password, profile_picture
    // json returned:
    // id, username, profile_picture

    user.validate()
        .map_err(|_| (Status::BadRequest, json_error("Failed JSON validation")))?;

    if user.confirm_password != user.password {
        return Err((Status::BadRequest, json_error("Passwords do not match")));
    }

    let username_exists = sqlx::query_scalar!(
        "SELECT 1 FROM users 
        WHERE username = $1",
        user.username.to_lowercase()
    )
    .fetch_optional(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, json_error("Database error")))?;

    if username_exists.is_some() {
        return Err((Status::BadRequest, json_error("Username already exists")));
    }

    // HASH PASSWORD
    let password = user.password.as_bytes();
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(password, &salt)
        .map_err(|_| {
            (
                Status::InternalServerError,
                json_error("Could not hash password"),
            )
        })?
        .to_string();

    // verify with https://docs.rs/argon2/latest/argon2/

    // let profile_picture = format!(
    //     "https://avatar.iran.liara.run/public/boy?username={0}",
    //     user.username
    // );

    let user_response = sqlx::query_as!(
        models::User,
        "INSERT INTO users (email, username, display_username, hashed_password)
        VALUES ($1, $2, $3, $4)
        RETURNING user_id, display_username, s3_icon_key, date_joined",
        user.email,
        user.username.to_lowercase(),
        user.username,
        password_hash,
    )
    .fetch_one(&mut **db)
    .await
    .map_err(|_| {
        (
            Status::InternalServerError,
            json_error("Database insertion failed"),
        )
    })?;

    let cookie = generate_token::jwt_cookie(user_response.user_id);
    jar.add(cookie);

    // Ok(status::Created::new("/signup").body(Json(user_response)))
    Ok((Status::Created, Json(user_response)))
}

#[post("/login", format = "json", data = "<user>")]
pub async fn login<'a>(
    user: Json<models::UserLoginInput<'_>>,
    mut db: Connection<database::HarmonyDb>,
    jar: &'a CookieJar<'_>,
) -> impl Responder<'a, 'a> {
    let user_data = sqlx::query!(
        "SELECT *
        FROM users 
        WHERE username = $1",
        user.username.to_lowercase()
    )
    .fetch_optional(&mut **db)
    .await
    .map_err(|_| (Status::BadRequest, json_error("Database error")))?
    .ok_or((Status::NotFound, json_error("Username doesn't exist")))?;

    let user_id = user_data.user_id;
    let display_username = user_data.display_username;
    let hashed_password = user_data.hashed_password;
    let s3_icon_key = user_data.s3_icon_key;
    let date_joined = user_data.date_joined;

    // check password correct
    let parsed_hash = PasswordHash::new(hashed_password.as_str()).map_err(|_| {
        (
            Status::InternalServerError,
            json_error("Could not parse hash"),
        )
    })?;
    if Argon2::default()
        .verify_password(user.password.as_bytes(), &parsed_hash)
        .is_err()
    {
        return Err((Status::BadRequest, json_error("Password incorrect")));
    }

    let cookie = generate_token::jwt_cookie(user_id);
    jar.add(cookie);

    let response = Json(models::User {
        user_id,
        display_username,
        s3_icon_key,
        date_joined,
    });

    Ok(response)
}

#[post("/logout")]
pub fn logout(jar: &CookieJar<'_>) -> Status {
    jar.remove("JWT");

    // "logged out successfully".to_string()
    Status::NoContent
}
