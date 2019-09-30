use super::response::ApiError;
use super::response::Result as ApiResult;
use actix_web::{middleware::Response, Error, HttpRequest, HttpResponse, ResponseError};
use state::AppState;

fn render(res: HttpResponse, replace: ApiError) -> Result<Response, Error> {
    if res.body().is_empty() {
        Ok(Response::Done(replace.error_response()))
    } else {
        Ok(Response::Done(res))
    }
}

pub fn render_503<S>(_: &mut HttpRequest<S>, res: HttpResponse) -> Result<Response, Error> {
    render(res, ApiError::InternalServerErrorWithoutReason)
}

pub fn render_500_api_endpoint_not_found<S>(
    _: &mut HttpRequest<S>,
    res: HttpResponse,
) -> Result<Response, Error> {
    render(res, ApiError::ApiEndpointNotFound)
}

pub fn render_500_invalid_parameters<S>(
    _: &mut HttpRequest<S>,
    res: HttpResponse,
) -> Result<Response, Error> {
    render(res, ApiError::InvalidParameters)
}

pub fn not_implemented(_: HttpRequest<AppState>) -> ApiResult<&'static str> {
    Err(ApiError::NotImplemented)
}
