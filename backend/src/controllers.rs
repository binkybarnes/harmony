pub mod auth_routes {
    use crate::database;
    use crate::models;
    use rocket::http::Status;
    use rocket::response::status;
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
    pub async fn signup(
        user: Json<models::UserSignupInput<'_>>,
        mut db: Connection<database::HarmonyDb>,
    ) -> impl Responder {
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
            "SELECT * FROM user_info 
            WHERE username = $1",
            user.username
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
            "INSERT INTO user_info (email, username, display_username, hashed_password, profile_picture)
            VALUES ($1, $2, $3, $4, $5) RETURNING id",
            user.email,
            user.username.to_lowercase(),
            user.username,
            password_hash,
            profile_picture,
        )
        .fetch_one(&mut **db)
        .await
        .map_err(|_| (Status::InternalServerError, "database insertion failed"))?;

        let response = Json(models::SignupResponse {
            id: result.id,
            username: user.username.to_string(),
            profile_picture: profile_picture,
        });
        Ok(status::Created::new("/signup").body(response))
    }

    #[post("/login")]
    pub fn login() {
        print!("bingus!");
    }

    #[post("/logout")]
    pub fn logout() {
        print!("bingus!");
    }
}
