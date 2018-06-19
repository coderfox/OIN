use actix_web::{middleware::{Middleware, Response, Started},
                Error,
                HttpRequest,
                HttpResponse};
use chrono::{DateTime, Utc};
#[cfg(feature = "sentry")]
use failure::Fail;
#[cfg(feature = "sentry")]
use sentry::{integrations::failure::exception_from_single_fail,
             protocol::{Event, Level},
             with_client_and_scope};

struct StartTime(pub DateTime<Utc>);

pub struct LogError;

impl<S> Middleware<S> for LogError {
    fn start(&self, req: &mut HttpRequest<S>) -> Result<Started, Error> {
        req.extensions_mut().insert(StartTime(Utc::now()));
        Ok(Started::Done)
    }
    fn response(&self, req: &mut HttpRequest<S>, res: HttpResponse) -> Result<Response, Error> {
        debug!(
            "{} {}b {} {} {}us",
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
                #[cfg(feature = "sentry")]
                report_actix_error_to_sentry(error);
                error!("error: {}", error)
            }
        }
        Ok(Response::Done(res))
    }
}

#[cfg(feature = "sentry")]
pub fn report_actix_error_to_sentry(err: &Error) {
    with_client_and_scope(|client, scope| {
        let mut exceptions = vec![exception_from_single_fail(
            err.as_response_error(),
            Some(err.backtrace()),
        )];
        let mut ptr: Option<&Fail> = err.as_response_error().cause();
        while let Some(cause) = ptr {
            exceptions.push(exception_from_single_fail(cause, cause.backtrace()));
            ptr = Some(cause);
        }
        exceptions.reverse();
        client.capture_event(
            Event {
                exceptions: exceptions,
                level: Level::Error,
                ..Default::default()
            },
            Some(scope),
        )
    });
}
