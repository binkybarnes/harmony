use crate::models::ErrorResponse;
use rocket::serde::json::Json;

pub fn json_error(message: &str) -> Json<ErrorResponse> {
    Json(ErrorResponse {
        error: message.to_string(),
    })
}
