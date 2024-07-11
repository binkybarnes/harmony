pub mod auth_routes {
    use crate::database;
    use crate::models;
    use rocket::http::Status;
    use rocket::serde::{json::Json, Deserialize, Serialize};
    use rocket::{
        response::{self, status, Debug, Responder},
        Request,
    };
    use rocket_db_pools::Connection;
    use thiserror::Error;
    use validator::{Validate, ValidationErrors};

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

    #[derive(Responder)]
    pub enum CustomResponse {
        #[response(status = 200, content_type = "json")]
        Approved(Json<i64>),
        #[response(status = 400, content_type = "json")]
        BadRequest(String),
        #[response(status = 500, content_type = "json")]
        InternalServerError(String),
    }

    #[post("/signup", format = "json", data = "<user>")]
    pub async fn signup(
        user: Json<models::UserSignupInput<'_>>,
        mut db: Connection<database::HarmonyDb>,
    ) -> CustomResponse {
        // json input:
        // email, username, password, confirmPassword
        // json inserted:
        // email, username, password, profilePicture
        // json returned: id
        // match user.validate() {
        //     Ok(_) => (),
        //     Err(e) => return CustomResponse::BadRequest(String::from("failed JSON validation")),
        // };
        match user.validate() {
            Ok(_) => (),
            Err(_) => return CustomResponse::BadRequest(String::from("failed JSON validation")),
        }

        if user.confirm_password != user.password {
            return CustomResponse::BadRequest(String::from("Passwords do not match"));
        }

        let result = sqlx::query!(
            "INSERT INTO user_info (email, username, password) VALUES ($1, $2, $3) RETURNING id",
            user.email,
            user.username,
            user.password,
        )
        .fetch_one(&mut **db)
        .await;

        // Ok(Json(result.id))
        match result {
            Ok(r) => CustomResponse::Approved(Json(r.id)),
            Err(e) => CustomResponse::InternalServerError(String::from("Database error")),
        }
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
