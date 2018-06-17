use actix_web::{middleware::Response, Error, HttpRequest, HttpResponse, ResponseError};
use response::ApiError;

fn render(res: HttpResponse, replace: ApiError) -> Result<Response, Error> {
    if res.body().is_empty() {
        Ok(Response::Done(replace.error_response()))
    } else {
        Ok(Response::Done(res))
    }
}

pub fn render_500<S>(_: &mut HttpRequest<S>, res: HttpResponse) -> Result<Response, Error> {
    render(res, ApiError::InternalServerErrorWithoutReason)
}

pub fn render_400<S>(_: &mut HttpRequest<S>, res: HttpResponse) -> Result<Response, Error> {
    render(res, ApiError::BadRequest)
}

pub fn render_404<S>(_: &mut HttpRequest<S>, res: HttpResponse) -> Result<Response, Error> {
    render(res, ApiError::ApiEndpointNotFound)
}
