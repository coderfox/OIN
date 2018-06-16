pub mod users;

pub mod error;

use actix_web::{middleware::{Middleware, Response},
                Error,
                HttpRequest,
                HttpResponse};
use response::ApiError;
use state::AppState;

pub fn default_route(_: HttpRequest<AppState>) -> Result<&'static str, ApiError> {
    Err(ApiError::ApiEndpointNotFound)
}

pub struct LogError;

impl<S> Middleware<S> for LogError {
    fn response(&self, _: &mut HttpRequest<S>, resp: HttpResponse) -> Result<Response, Error> {
        if resp.status().is_server_error() {
            if let Some(error) = resp.error() {
                println!("error: {:?}", error)
            }
        }
        Ok(Response::Done(resp))
    }
}
