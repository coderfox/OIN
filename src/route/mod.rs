pub mod users;

use actix_web::HttpRequest;
use response::ApiError;
use state::AppState;

pub fn default_route(_: HttpRequest<AppState>) -> Result<&'static str, ApiError> {
    Err(ApiError::ApiEndpointNotFound)
}
