use actix_web::error::ResponseError;
use actix_web::{http::StatusCode, HttpResponse};
use futures::Future;
use std;
use std::error;
use std::fmt;

#[allow(dead_code)] // TODO: remove this
pub type Result<T> = std::result::Result<T, ApiError>;
pub type FutureResponse = Box<Future<Item = HttpResponse, Error = ApiError>>;

#[derive(Serialize)]
pub struct ErrorResponse {
    pub code: String,
}

#[derive(Debug)]
pub enum ApiError {
    InternalServerError(Box<error::Error + Send + Sync>),
    ApiEndpointNotFound,
}

impl ApiError {
    pub fn from_error_boxed(err: Box<error::Error + Send + Sync>) -> Self {
        ApiError::InternalServerError(err)
    }
    pub fn code(&self) -> &'static str {
        match self {
            ApiError::InternalServerError(_) => "INTERNAL_SERVER_ERROR",
            ApiError::ApiEndpointNotFound => "API_ENDPOINT_NOT_FOUND",
        }
    }
    pub fn status(&self) -> StatusCode {
        match self {
            ApiError::InternalServerError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::ApiEndpointNotFound => StatusCode::NOT_FOUND,
        }
    }
}

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "api error {}",
            if let ApiError::InternalServerError(ref base_error) = self {
                base_error.as_ref().description()
            } else {
                self.code()
            }
        )
    }
}

impl error::Error for ApiError {
    fn description(&self) -> &str {
        if let ApiError::InternalServerError(ref base_error) = self {
            base_error.as_ref().description()
        } else {
            self.code()
        }
    }

    fn cause(&self) -> Option<&error::Error> {
        if let ApiError::InternalServerError(ref base_error) = self {
            Some(base_error.as_ref())
        } else {
            None
        }
    }
}

impl Into<&'static str> for ApiError {
    fn into(self) -> &'static str {
        self.code()
    }
}

impl ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status()).json(ErrorResponse {
            code: self.code().to_owned(),
        })
    }
}
