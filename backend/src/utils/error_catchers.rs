use rocket::{serde::json::Json, Request};

use crate::models::ErrorResponse;

use super::json_error::json_error;

// catchers ------------------------------

// not authorized
#[catch(401)]
pub fn not_authorized() -> Json<ErrorResponse> {
    json_error("Not authorized. Try logging in again")
}
