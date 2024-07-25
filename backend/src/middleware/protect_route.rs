use crate::models;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::Status;
use rocket::request::{self, FromRequest, Outcome, Request};
pub struct JwtGuard(models::Claims);

#[rocket::async_trait]
impl<'r> FromRequest<'r> for JwtGuard {
    type Error = ();
    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        if let Some(cookie) = request.cookies().get("JWT") {
            let jwt = cookie.value();
            match validate_jwt(jwt) {
                Ok(claims) => Outcome::Success(JwtGuard(claims)),
                Err(_) => Outcome::Error((Status::Unauthorized, ())),
            }
        } else {
            Outcome::Error((Status::Unauthorized, ()))
        }
    }
}

fn validate_jwt(token: &str) -> Result<models::Claims, String> {
    let secret: String = dotenv::var("JWT_SECRET").expect("set JWT_SECRET in .env");
    decode::<models::Claims>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    )
    .map(|token_data| token_data.claims)
    .map_err(|err| err.to_string())
}
