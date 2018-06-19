use actix;
use actix_web::error::ResponseError;
use actix_web::{http::StatusCode, HttpResponse};
use diesel::result::Error as DieselError;
use failure::Fail;
use futures::Future;
use state::QueryError;
use std;
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
    InternalServerError(Box<Fail>),
    InternalServerErrorWithoutReason,
    NotImplemented,               // TODO: drop this
    ApiEndpointNotFound,          // generic
    BadRequest,                   // generic
    DuplicatedEmail,              // POST /users
    BasicAuthUserNotExists,       // basic auth
    BasicAuthPasswordMismatch,    // basic auth
    NotAuthenticated,             // generic auth
    CorruptedAuthorizationHeader, // generic auth
    InvalidAuthType,              // generic auth
    BearerAuthInvalidToken,       // bearer auth
    SubscriptionNotFound,         // subscription
    InsufficientPermission,       // generic auth
    ServiceNotFound,              // service
}

impl ApiError {
    pub fn from_error_boxed(err: Box<Fail>) -> Self {
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
            NotImplemented => "NOT_IMPLEMENTED",
            ApiEndpointNotFound => "API_ENDPOINT_NOT_FOUND",
            BadRequest => "BAD_REQUEST",
            DuplicatedEmail => "DUPLICATED_EMAIL",
            BasicAuthUserNotExists => "USER_NOT_EXIST",
            BasicAuthPasswordMismatch => "PASSWORD_MISMATCH",
            InvalidAuthType => "INVALID_AUTHENTICATION_TYPE",
            NotAuthenticated => "NOT_AUTHENTICATED",
            CorruptedAuthorizationHeader => "CORRUPTED_AUTHORIZATION_HEADER",
            BearerAuthInvalidToken => "INVALID_TOKEN",
            SubscriptionNotFound => "SUBSCRIPTION_NOT_FOUND",
            InsufficientPermission => "INSUFFICIENT_PERMISSION",
            ServiceNotFound => "SERVICE_NOT_FOUND",
        }
    }
    pub fn status(&self) -> StatusCode {
        use self::ApiError::*;
        match self {
            InternalServerError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            InternalServerErrorWithoutReason => StatusCode::INTERNAL_SERVER_ERROR,
            NotImplemented => StatusCode::NOT_IMPLEMENTED,
            ApiEndpointNotFound => StatusCode::NOT_FOUND,
            BadRequest => StatusCode::BAD_REQUEST,
            DuplicatedEmail => StatusCode::CONFLICT,
            BasicAuthUserNotExists => StatusCode::FORBIDDEN,
            BasicAuthPasswordMismatch => StatusCode::FORBIDDEN,
            InvalidAuthType => StatusCode::UNAUTHORIZED,
            NotAuthenticated => StatusCode::UNAUTHORIZED,
            CorruptedAuthorizationHeader => StatusCode::BAD_REQUEST,
            BearerAuthInvalidToken => StatusCode::FORBIDDEN,
            SubscriptionNotFound => StatusCode::NOT_FOUND,
            InsufficientPermission => StatusCode::FORBIDDEN,
            ServiceNotFound => StatusCode::NOT_FOUND,
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
    fn cause(&self) -> Option<&Fail> {
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
