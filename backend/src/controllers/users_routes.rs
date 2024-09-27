use crate::database::HarmonyDb;
use crate::middleware::protect_route::JwtGuard;
use crate::models::{EditUserInput, ErrorResponse, Server, ServerIds, User};
use crate::utils::aws_s3_utils::{remove_from_s3, upload_to_s3};
use crate::utils::json_error::json_error;
use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::Client;
use rocket::form::Form;
use rocket::http::uri::Query;
use rocket::http::Status;
use rocket::response::Responder;
use rocket::serde::json::Json;
use rocket::State;
use rocket_db_pools::Connection;

// get list of users given vector of server_ids

// only can edit profile picture for now
#[patch("/edit", data = "<user_input>")]
pub async fn edit_user(
    guard: JwtGuard,
    user_input: Form<EditUserInput>,
    aws_client: &State<Client>,
    mut db: Connection<HarmonyDb>,
) -> Result<Json<User>, (Status, Json<ErrorResponse>)> {
    let user_id = &guard.0.sub;
    let user_icon = &user_input.user_icon;

    // change user icon if provided
    if let Some(user_icon) = user_icon {
        upload_to_s3(
            aws_client,
            "user-icons",
            &user_icon.key,
            ByteStream::from(user_icon.data.value.clone()),
        )
        .await
        .map_err(|_| (Status::BadRequest, json_error("Server picture S3 failed")))?;

        let old_icon_key =
            sqlx::query_scalar!("SELECT s3_icon_key FROM users WHERE user_id = $1", user_id)
                .fetch_one(&mut **db)
                .await
                .map_err(|_| {
                    (
                        Status::InternalServerError,
                        json_error("Database error; does user_id exist?"),
                    )
                })?;

        // update profile picture of all user's messages
        sqlx::query!(
            "UPDATE messages
            SET s3_icon_key = $1
            WHERE user_id = $2",
            &user_icon.key,
            user_id
        )
        .execute(&mut **db)
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                json_error("Database error; does user_id exist?"),
            )
        })?;

        // if there was a previous icon, remove it from s3
        if let Some(old_icon_key) = old_icon_key {
            remove_from_s3(aws_client, "user-icons", &old_icon_key)
                .await
                .map_err(|_| {
                    (
                        Status::BadRequest,
                        json_error("Failed to remove user icon from S3"),
                    )
                })?;
        }

        sqlx::query!(
            r#"UPDATE users
            SET s3_icon_key = $1
            WHERE user_id = $2
            "#,
            user_icon.key,
            user_id
        )
        .execute(&mut **db)
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                json_error("Database error; does user_id exist?"),
            )
        })?;
    };

    // return updated user
    let user = sqlx::query_as!(
        User,
        r#"SELECT
        user_id, display_username, s3_icon_key, date_joined
        FROM users
        WHERE user_id = $1
        "#,
        user_id,
    )
    .fetch_one(&mut **db)
    .await
    .map_err(|_| {
        (
            Status::InternalServerError,
            json_error("Database error; does user_id exist?"),
        )
    })?;

    Ok(Json(user))
}
