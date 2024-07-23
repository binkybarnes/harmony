pub mod auth_routes {
    use crate::database;
    use crate::models;

    use crate::utils::generate_token;
    use rocket::http::{Cookie, CookieJar, Status};
    use rocket::response::status;
    use rocket::response::status::BadRequest;
    use rocket::serde::{json::Json, Deserialize, Serialize};
    use rocket::{
        response::{self, status::Created, Debug, Responder},
        Request,
    };
    use rocket_db_pools::Connection;
    use validator::{Validate, ValidationErrors};

    use argon2::{
        password_hash::{
            rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString,
        },
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
            .map_err(|_| (Status::BadRequest, "failed JSON validation"))?;

        if user.confirm_password != user.password {
            return Err((Status::BadRequest, "passwords do not match"));
        }

        let username_exists = sqlx::query!(
            "SELECT * FROM users 
            WHERE username = $1",
            user.username.to_lowercase()
        )
        .fetch_optional(&mut **db)
        .await
        .map_err(|_| (Status::BadRequest, "database error"))?;

        if username_exists.is_some() {
            return Err((Status::BadRequest, "username already exists"));
        }

        // HASH PASSWORD
        let password = user.password.as_bytes();
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(password, &salt)
            .map_err(|_| (Status::InternalServerError, "could not hash password"))?
            .to_string();

        // verify with https://docs.rs/argon2/latest/argon2/

        let profile_picture = format!(
            "https://avatar.iran.liara.run/public/boy?username={0}",
            user.username
        );

        let result = sqlx::query!(
            "INSERT INTO users (email, username, display_username, hashed_password, profile_picture)
            VALUES ($1, $2, $3, $4, $5) RETURNING user_id",
            user.email,
            user.username.to_lowercase(),
            user.username,
            password_hash,
            profile_picture,
        )
        .fetch_one(&mut **db)
        .await
        .map_err(|_| (Status::InternalServerError, "database insertion failed"))?;

        let cookie = generate_token::jwt_cookie(result.user_id.into());
        jar.add(cookie);

        let response = Json(models::DefaultResponse {
            id: result.user_id,
            username: user.username.to_string(),
            profile_picture,
        });
        Ok(status::Created::new("/signup").body(response))
    }

    #[post("/login", format = "json", data = "<user>")]
    pub async fn login<'a>(
        user: Json<models::UserLoginInput<'_>>,
        mut db: Connection<database::HarmonyDb>,
        jar: &'a CookieJar<'_>,
    ) -> impl Responder<'a, 'a> {
        let user_exists = sqlx::query!(
            "SELECT * FROM users 
            WHERE username = $1",
            user.username.to_lowercase()
        )
        .fetch_optional(&mut **db)
        .await
        .map_err(|_| (Status::BadRequest, "database error"))?;

        let record = match user_exists {
            Some(record) => record,
            None => return Err((Status::BadRequest, "Username doesn't exist")),
        };
        // check password correct
        let parsed_hash = PasswordHash::new(&record.hashed_password)
            .map_err(|_| (Status::InternalServerError, "could not parse hash"))?;
        if Argon2::default()
            .verify_password(user.password.as_bytes(), &parsed_hash)
            .is_err()
        {
            return Err((Status::BadRequest, "Password incorrect"));
        }

        let cookie = generate_token::jwt_cookie(record.user_id.into());
        jar.add(cookie);

        let response = Json(models::DefaultResponse {
            id: record.user_id,
            username: record.username,
            profile_picture: record.profile_picture.unwrap_or_default(),
        });

        Ok(response)
    }

    #[post("/logout")]
    pub fn logout(jar: &CookieJar<'_>) -> String {
        jar.remove("JWT");

        "logged out successfully".to_string()
    }
}
