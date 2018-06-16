use actix_web::http::header;
use actix_web::*;
use base64::decode;
use futures::Future;
use model::User;
use response::ApiError;
use state::AppState;

trait AuthHeader
where
    Self: Sized,
{
    fn from_header_value(header: &str) -> Result<Self, ApiError>;
    fn schema() -> &'static str;
    fn from_header(header: &str) -> Result<Self, ApiError> {
        header
            .find(' ')
            .map_or(Err(ApiError::CorruptedAuthorizationHeader), |loc| {
                Ok(header.split_at(loc))
            })
            .and_then(|(schema, value)| {
                if schema == Self::schema() {
                    Ok(Self::from_header_value(&value[1..])?)
                } else {
                    Err(ApiError::BasicAuthInvalidAuthType)
                }
            })
    }
}

#[derive(Debug, PartialEq)]
pub struct BasicAuthHeader {
    username: String,
    password: String,
}

impl AuthHeader for BasicAuthHeader {
    fn from_header_value(header: &str) -> Result<Self, ApiError> {
        decode(header)
            .map_err(|_| ApiError::CorruptedAuthorizationHeader)
            .and_then(|v| String::from_utf8(v).map_err(|_| ApiError::CorruptedAuthorizationHeader))
            .and_then(|t| {
                let mut parts = t.split(':');
                let username = parts.next();
                let password = parts.next();
                if username == None || password == None {
                    Err(ApiError::CorruptedAuthorizationHeader)
                } else {
                    Ok(BasicAuthHeader {
                        username: username.unwrap().to_owned(),
                        password: password.unwrap().to_owned(),
                    })
                }
            })
    }
    fn schema() -> &'static str {
        "Basic"
    }
}

/*
pub struct BasicAuthConfig;

impl Default for BasicAuthConfig {
    fn default() -> Self {
        BasicAuthConfig
    }
}

pub struct BasicAuth(User);

impl FromRequest<AppState> for BasicAuth {
    type Config = BasicAuthConfig;
    type Result = Result<Self, Error>; // Box<Future<Item = Self, Error = Error>>;
    fn from_request(req: &HttpRequest<AppState>, cfg: &Self::Config) -> Self::Result {
        let auth_header = req.headers().get(header::AUTHORIZATION);
        // println!("{:?}", auth_header.unwrap());
        Ok(BasicAuth {
            user_id: auth_header
                .unwrap()
                .to_str()
                .map_err(ApiError::from_error)?
                .to_string(),
        })
    }
}

pub struct TokenAuth {
    token: String,
    user_id: String,
}
*/

#[cfg(test)]
mod tests {
    mod basic_basic {
        use base64::encode;
        use response::ApiError;

        use super::super::AuthHeader;
        use super::super::BasicAuthHeader;

        #[test]
        fn test_basic_auth() {
            assert_eq!(
                BasicAuthHeader::from_header_value(&encode("username:password")),
                Ok(BasicAuthHeader {
                    username: "username".to_owned(),
                    password: "password".to_owned()
                })
            );
        }

        #[test]
        fn test_basic_auth_no_password() {
            assert_eq!(
                BasicAuthHeader::from_header_value(&encode("username:")),
                Ok(BasicAuthHeader {
                    username: "username".to_owned(),
                    password: "".to_owned()
                })
            );
        }

        #[test]
        fn test_basic_auth_no_username() {
            assert_eq!(
                BasicAuthHeader::from_header_value(&encode(":password")),
                Ok(BasicAuthHeader {
                    username: "".to_owned(),
                    password: "password".to_owned()
                })
            );
        }

        #[test]
        fn test_basic_auth_corrupted_header_1() {
            assert_eq!(
                BasicAuthHeader::from_header_value("SOMETHING_NOT_BASE64"),
                Err(ApiError::CorruptedAuthorizationHeader)
            );
        }

        #[test]
        fn test_basic_auth_corrupted_header_2() {
            assert_eq!(
                BasicAuthHeader::from_header_value(&encode("NOT_CORRECT_HEADER")),
                Err(ApiError::CorruptedAuthorizationHeader)
            );
        }
    }

    mod auth_header {
        use base64::encode;
        use response::ApiError;

        use super::super::AuthHeader;
        use super::super::BasicAuthHeader;

        #[test]
        fn parse_basic() {
            assert_eq!(
                BasicAuthHeader::from_header(&format!("Basic {}", &encode("username:password"))),
                Ok(BasicAuthHeader {
                    username: "username".to_owned(),
                    password: "password".to_owned(),
                })
            );
        }

        #[test]
        fn parse_basic_mismatch() {
            assert_eq!(
                BasicAuthHeader::from_header("Bearer 4e240c20-f95c-4adc-99c4-1a42e5492dcc"),
                Err(ApiError::BasicAuthInvalidAuthType)
            );
        }
    }
}
