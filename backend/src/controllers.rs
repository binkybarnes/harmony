pub mod auth_routes {
    use crate::database;
    use crate::models;
    use rocket::http::Status;
    use rocket::serde::{json::Json, Deserialize, Serialize};
    use rocket::{
        response::{self, Debug, Responder},
        Request,
    };
    use rocket_db_pools::Connection;
    use validator::{Validate, ValidationErrors};

    type Result<T, E = CustomError> = std::result::Result<T, E>;

    // Define a custom error type
    #[derive(Debug)]
    pub enum CustomError {
        ValidationFailed(ValidationErrors),
        DatabaseError(rocket_db_pools::sqlx::Error),
    }

    impl From<ValidationErrors> for CustomError {
        fn from(error: ValidationErrors) -> Self {
            CustomError::ValidationFailed(error)
        }
    }
    impl From<sqlx::Error> for CustomError {
        fn from(error: rocket_db_pools::sqlx::Error) -> Self {
            CustomError::DatabaseError(error)
        }
    }

    impl<'r> Responder<'r, 'r> for CustomError {
        fn respond_to(self, _: &Request) -> response::Result<'r> {
            Err(Status::InternalServerError)
        }
    }

    #[post("/signup", format = "json", data = "<user>")]
    pub async fn signup(
        user: Json<models::UserSignupInput<'_>>,
        mut db: Connection<database::HarmonyDb>,
    ) -> Result<Json<i64>> {
        // json input:
        // email, username, password, confirmPassword
        // json inserted:
        // email, username, password, profilePicture
        // json returned: id
        user.validate().map_err(CustomError::ValidationFailed)?;

        let result = sqlx::query!(
            "INSERT INTO user_info (email, username, password) VALUES ($1, $2, $3) RETURNING id",
            user.email,
            user.username,
            user.password,
        )
        .fetch_one(&mut **db)
        .await?;

        Ok(Json(result.id))
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
