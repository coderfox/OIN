use std;
use std::error;
use std::fmt;

pub type Result<T> = std::result::Result<T, ApiError>;

#[derive(Debug)]
// Define our error types. These may be customized for our error handling cases.
// Now we will be able to write our own errors, defer to an underlying error
// implementation, or do something in between.
pub struct ApiError {
    code: &'static str,
    base_error: Option<Box<error::Error>>,
}

impl ApiError {
    pub fn from_error_boxed(err: Box<error::Error>) -> Self {
        Self {
            code: code::INTERNAL_SERVER_ERROR,
            base_error: Some(err),
        }
    }
    pub fn from_code(code: &'static str) -> Self {
        Self {
            code,
            base_error: None,
        }
    }
}

// Generation of an error is completely separate from how it is displayed.
// There's no need to be concerned about cluttering complex logic with the display style.
//
// Note that we don't store any extra info about the errors. This means we can't state
// which string failed to parse without modifying our types to carry that information.
impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "api error {}",
            if let Some(ref cause) = self.base_error {
                cause.as_ref().description()
            } else {
                self.code
            }
        )
    }
}

// This is important for other errors to wrap this one.
impl error::Error for ApiError {
    fn description(&self) -> &str {
        self.base_error
            .as_ref()
            .map_or_else(|| self.code, |e| e.description())
    }

    fn cause(&self) -> Option<&error::Error> {
        self.base_error.as_ref().map(|e| e.as_ref())
    }
}

pub mod code {
    pub const INTERNAL_SERVER_ERROR: &'static str = "INTERNAL_SERVER_ERROR";
}
