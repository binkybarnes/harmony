use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use rocket::serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    user_id: i64,
    iat: usize, // Optional. Issued at (as UTC timestamp)
    exp: usize, // Required (validate_exp defaults to true in validation). Expiration time (as UTC timestamp)
}

pub fn generate_token_set_cookie(user_id: i64) -> String {
    dotenv::from_filename("../.env").ok();
    let secret: String = dotenv::var("JWT_SECRET").expect("set JWT_SECRET in .env");

    let iat = chrono::Utc::now();
    let exp = iat + chrono::Duration::hours(12);

    let claims = Claims {
        user_id,
        iat: iat.timestamp() as usize,
        exp: exp.timestamp() as usize,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
    .expect("failed token generation");

    token
}
