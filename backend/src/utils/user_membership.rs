use crate::utils::json_error::json_error;
use crate::{database, models::ErrorResponse};
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket_db_pools::Connection;

pub trait UserMembershipChecker {
    async fn user_in_server(
        &self,
        db: &mut Connection<database::HarmonyDb>,
        user_id: i32,
    ) -> Result<(), (Status, Json<ErrorResponse>)>;
}

pub struct ByChannel {
    pub channel_id: i32,
}

pub struct ByServer {
    pub server_id: i32,
}

impl UserMembershipChecker for ByChannel {
    async fn user_in_server(
        &self,
        db: &mut Connection<database::HarmonyDb>,
        user_id: i32,
    ) -> Result<(), (Status, Json<ErrorResponse>)> {
        // Fetch server_id from channel
        let server_id = sqlx::query_scalar!(
            "SELECT server_id FROM channels WHERE channel_id = $1",
            self.channel_id
        )
        .fetch_optional(&mut ***db)
        .await
        .map_err(|_| (Status::InternalServerError, json_error("database error")))?
        .ok_or((Status::NotFound, json_error("channel not found")))?;

        // Check if the user is in the server
        sqlx::query_scalar!(
            "SELECT 1 FROM users_servers WHERE user_id = $1 AND server_id = $2",
            user_id,
            server_id
        )
        .fetch_optional(&mut ***db)
        .await
        .map_err(|_| (Status::InternalServerError, json_error("database error")))?
        .ok_or((Status::Forbidden, json_error("user not in server")))?;

        Ok(())
    }
}

impl UserMembershipChecker for ByServer {
    async fn user_in_server(
        &self,
        db: &mut Connection<database::HarmonyDb>,
        user_id: i32,
    ) -> Result<(), (Status, Json<ErrorResponse>)> {
        // check if server exists
        sqlx::query_scalar!("SELECT 1 FROM servers WHERE server_id = $1", self.server_id)
            .fetch_optional(&mut ***db)
            .await
            .map_err(|_| (Status::InternalServerError, json_error("database error")))?
            .ok_or((Status::NotFound, json_error("server not found")))?;

        // Check if the user is in the server
        sqlx::query_scalar!(
            "SELECT 1 FROM users_servers WHERE user_id = $1 AND server_id = $2",
            user_id,
            self.server_id
        )
        .fetch_optional(&mut ***db)
        .await
        .map_err(|_| (Status::InternalServerError, json_error("database error")))?
        .ok_or((Status::Forbidden, json_error("user not in server")))?;

        Ok(())
    }
}
