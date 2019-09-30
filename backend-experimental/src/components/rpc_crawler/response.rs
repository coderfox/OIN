use actix;
use actix_web::error::ResponseError;
use actix_web::HttpRequest;
use actix_web::Responder;
use actix_web::{http::StatusCode, HttpResponse};
use diesel::result::Error as DieselError;
use failure::Fail;
use futures::Future;
use serde::Serialize;
use state::QueryError;
use std;
use std::fmt;

#[allow(dead_code)] // TODO: remove this
pub type Result<T> = std::result::Result<RpcResponse<T>, ApiError>;
#[allow(dead_code)] // TODO: remove this
pub type FutureResponse<T> = Box<dyn Future<Item = RpcResponse<T>, Error = ApiError>>;

#[derive(Serialize)]
pub struct RpcResponse<T: Serialize> {
    result: T,
}

impl<T: Serialize> RpcResponse<T> {
    pub fn new(result: T) -> Self {
        Self { result }
    }
}

impl<T: Serialize> Responder for RpcResponse<T> {
    type Item = HttpResponse;
    type Error = ApiError;
    fn respond_to<S>(self, _req: &HttpRequest<S>) -> std::result::Result<Self::Item, Self::Error> {
        Ok(HttpResponse::Ok().json(self))
    }
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub code: String,
}

#[derive(Debug)]
pub enum ApiError {
    InternalServerError(Box<dyn Fail>),
    InternalServerErrorWithoutReason,
    ApiEndpointNotFound,
    InvalidParameters,
    NotImplemented, // TODO: drop this
    InsufficientPermission,
}

impl ApiError {
    pub fn from_error_boxed(err: Box<dyn Fail>) -> Self {
        ApiError::InternalServerError(err)
    }
    pub fn from_error<T: Fail>(err: T) -> Self {
        ApiError::from_error_boxed(Box::new(err))
    }
    pub fn code(&self) -> &'static str {
        use self::ApiError::*;
        match self {
            InternalServerError(_) => "INTERNAL_SERVER_ERROR",
            InternalServerErrorWithoutReason => "INTERNAL_SERVER_ERROR",
            ApiEndpointNotFound => "API_ENDPOINT_NOT_FOUND",
            InvalidParameters => "INVALID_PARAMETERS",
            NotImplemented => "NOT_IMPLEMENTED",
            InsufficientPermission => "INSUFFICIENT_PERMISSION",
        }
    }
    pub fn status(&self) -> StatusCode {
        use self::ApiError::*;
        match self {
            InternalServerError(_) => StatusCode::SERVICE_UNAVAILABLE,
            InternalServerErrorWithoutReason => StatusCode::SERVICE_UNAVAILABLE,
            NotImplemented => StatusCode::NOT_IMPLEMENTED,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "{}",
            if let ApiError::InternalServerError(ref base_error) = self {
                format!("internal error: {}", base_error.as_ref())
            } else {
                format!("handled error: {}", self.code())
            }
        )
    }
}

impl Fail for ApiError {
    fn cause(&self) -> Option<&dyn Fail> {
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

impl PartialEq<ApiError> for ApiError {
    fn eq(&self, other: &Self) -> bool {
        self.code() == other.code()
    }
}

impl From<actix::MailboxError> for ApiError {
    fn from(err: actix::MailboxError) -> Self {
        Self::from_error(err)
    }
}

impl From<DieselError> for ApiError {
    fn from(err: DieselError) -> Self {
        Self::from_error(err)
    }
}

impl From<QueryError> for ApiError {
    fn from(err: QueryError) -> Self {
        use self::QueryError::*;

        match err {
            DieselError(err) => err.into(),
            ActixError(err) => err.into(),
        }
    }
}
