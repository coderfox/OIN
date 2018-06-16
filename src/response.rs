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
    InternalServerErrorWithoutReason,
    ApiEndpointNotFound,
    BadRequest,
    DuplicatedEmail,              // POST /users
    BasicAuthUserNotExists,       // basic auth
    BasicAuthPasswordMismatch,    // basic auth
    BasicAuthInvalidAuthType,     // basic auth
    NotAuthenticated,             // generic auth
    CorruptedAuthorizationHeader, // generic auth
    BearerAuthInvalidToken,       // bearer auth
    BearerAuthInvalidAuthType,    // bearer auth
}

impl ApiError {
    pub fn from_error_boxed(err: Box<error::Error + Send + Sync>) -> Self {
        ApiError::InternalServerError(err)
    }
    pub fn from_error<T: 'static + error::Error + Send + Sync>(err: T) -> Self {
        ApiError::from_error_boxed(Box::new(err))
    }
    pub fn code(&self) -> &'static str {
        use self::ApiError::*;
        match self {
            InternalServerError(_) => "INTERNAL_SERVER_ERROR",
            ApiEndpointNotFound => "API_ENDPOINT_NOT_FOUND",
            InternalServerErrorWithoutReason => "INTERNAL_SERVER_ERROR",
            BadRequest => "BAD_REQUEST",
            DuplicatedEmail => "DUPLICATED_EMAIL",
            BasicAuthUserNotExists => "USER_NOT_EXIST",
            BasicAuthPasswordMismatch => "PASSWORD_MISMATCH",
            BasicAuthInvalidAuthType => "INVALID_AUTHENTICATION_TYPE",
            NotAuthenticated => "NOT_AUTHENTICATED",
            CorruptedAuthorizationHeader => "CORRUPTED_AUTHORIZATION_HEADER",
            BearerAuthInvalidToken => "INVALID_TOKEN",
            BearerAuthInvalidAuthType => "INVALID_AUTHENTICATION_TYPE",
        }
    }
    pub fn status(&self) -> StatusCode {
        use self::ApiError::*;
        match self {
            InternalServerError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiEndpointNotFound => StatusCode::NOT_FOUND,
            InternalServerErrorWithoutReason => StatusCode::INTERNAL_SERVER_ERROR,
            BadRequest => StatusCode::BAD_REQUEST,
            DuplicatedEmail => StatusCode::CONFLICT,
            BasicAuthUserNotExists => StatusCode::FORBIDDEN,
            BasicAuthPasswordMismatch => StatusCode::FORBIDDEN,
            BasicAuthInvalidAuthType => StatusCode::UNAUTHORIZED,
            NotAuthenticated => StatusCode::UNAUTHORIZED,
            CorruptedAuthorizationHeader => StatusCode::BAD_REQUEST,
            BearerAuthInvalidToken => StatusCode::FORBIDDEN,
            BearerAuthInvalidAuthType => StatusCode::UNAUTHORIZED,
        }
    }
}

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "{}",
            if let ApiError::InternalServerError(ref base_error) = self {
                format!("internal error: {}", base_error.as_ref().description())
            } else {
                format!("handled error: {}", self.code())
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

impl PartialEq<ApiError> for ApiError {
    fn eq(&self, other: &Self) -> bool {
        self.code() == other.code()
    }
}
