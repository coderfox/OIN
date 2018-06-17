pub mod session;
pub mod users;

pub mod error;

use actix_web::{middleware::{Middleware, Response, Started},
                Error,
                HttpRequest,
                HttpResponse};
use chrono::{DateTime, Utc};

struct StartTime(pub DateTime<Utc>);

pub struct LogError;

impl<S> Middleware<S> for LogError {
    fn start(&self, req: &mut HttpRequest<S>) -> Result<Started, Error> {
        req.extensions_mut().insert(StartTime(Utc::now()));
        Ok(Started::Done)
    }
    fn response(&self, req: &mut HttpRequest<S>, res: HttpResponse) -> Result<Response, Error> {
        debug!(
            "{} {}b {} {} {}ms",
            res.status(),
            res.response_size(),
            req.method(),
            req.uri(),
            req.extensions()
                .get()
                .and_then(|StartTime(time)| (Utc::now() - *time).num_microseconds())
                .unwrap_or(0)
        );
        if res.status().is_server_error() {
            if let Some(error) = res.error() {
                error!("error: {}", error)
            }
        }
        Ok(Response::Done(res))
    }
}
