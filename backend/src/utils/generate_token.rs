use crate::models;
use cookie::{time::Duration, Cookie};
use jsonwebtoken::{encode, EncodingKey, Header};
// #[derive(Debug, Serialize, Deserialize)]
// struct Claims {
//     user_id: i64,
//     iat: usize, // Optional. Issued at (as UTC timestamp)
//     exp: usize, // Required (validate_exp defaults to true in validation). Expiration time (as UTC timestamp)
// }

pub fn jwt_cookie(user_id: i32) -> Cookie<'static> {
    let secret: String = dotenv::var("JWT_SECRET").expect("set JWT_SECRET in .env");

    let iat = chrono::Utc::now();
    let exp = iat + chrono::Duration::days(7);

    let claims = models::Claims {
        sub: user_id,
        iat: iat.timestamp() as usize,
        exp: exp.timestamp() as usize,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
    .expect("failed token generation");

    // secure must be true when different origin and same site is none, or cookies wont be sent from the browser
    Cookie::build(("JWT", token))
        .path("/")
        .max_age(Duration::hours(12))
        .secure(true) //dotenv::var("RUST_ENV").expect("set RUST_ENV") != "development")
        .http_only(true)
        .same_site(cookie::SameSite::None)
        .build()
        .into_owned()
}
