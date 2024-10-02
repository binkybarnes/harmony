use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::{Header, Method, Status};
use rocket::{Request, Response};
pub struct Cors;

#[rocket::async_trait]
impl Fairing for Cors {
    fn info(&self) -> Info {
        Info {
            name: "Add CORS headers to responses",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, request: &'r Request<'_>, response: &mut Response<'r>) {
        if request.method() == Method::Options {
            response.set_status(Status::NoContent);
            response.set_header(Header::new(
                "Access-Control-Allow-Methods",
                "POST, PATCH, GET, DELETE, OPTIONS",
            ));
            response.set_header(Header::new(
                "Access-Control-Allow-Headers",
                "content-type, authorization",
            ));
        }
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
        response.set_header(Header::new("Vary", "Origin"));
    }
    // async fn on_response<'r>(&self, _request: &'r Request<'_>, response: &mut Response<'r>) {
    //     response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
    //     response.set_header(Header::new(
    //         "Access-Control-Allow-Methods",
    //         "POST, GET, PATCH, OPTIONS",
    //     ));
    //     response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
    //     response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
    // }
}
