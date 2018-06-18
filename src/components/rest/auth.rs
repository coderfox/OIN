use super::response::ApiError;
use actix_web::Result;

pub use self::basic::{BasicAuth, BasicAuthHeader};
pub use self::bearer::{BearerAuth, BearerAuthHeader};

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
                    Err(ApiError::InvalidAuthType)
                }
            })
    }
}

mod basic {
    use super::ApiError;
    use super::AuthHeader;
    use actix_web::http::header;
    use actix_web::{Error, FromRequest, HttpMessage, HttpRequest, Result};
    use actor::db::{Query, QueryResult};
    use base64::decode;
    use diesel::ExpressionMethods;
    use diesel::QueryDsl;
    use futures::future::result;
    use futures::Future;
    use model::User;
    use state::AppState;

    #[derive(Debug, PartialEq)]
    pub struct BasicAuthHeader {
        pub username: String,
        pub password: String,
    }

    impl AuthHeader for BasicAuthHeader {
        fn from_header_value(header: &str) -> Result<Self, ApiError> {
            decode(header)
                .map_err(|_| ApiError::CorruptedAuthorizationHeader)
                .and_then(|v| {
                    String::from_utf8(v).map_err(|_| ApiError::CorruptedAuthorizationHeader)
                })
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

    pub struct BasicAuthConfig;

    impl Default for BasicAuthConfig {
        fn default() -> Self {
            BasicAuthConfig
        }
    }

    pub struct BasicAuth(pub User);

    impl FromRequest<AppState> for BasicAuth {
        type Config = BasicAuthConfig;
        type Result = Box<Future<Item = Self, Error = Error>>;
        fn from_request(req: &HttpRequest<AppState>, _: &Self::Config) -> Self::Result {
            use schema::user::dsl as udsl;

            let cloned_req = req.clone();
            let header_result = req.headers()
                .get(header::AUTHORIZATION)
                .map_or(Err(ApiError::NotAuthenticated), |v| {
                    v.to_str()
                        .map_err(|_| ApiError::CorruptedAuthorizationHeader)
                })
                .and_then(BasicAuthHeader::from_header);
            Box::new(
                result(header_result)
                    .and_then(move |header| {
                        let BasicAuthHeader { username, password } = header;
                        cloned_req
                            .state()
                            .db
                            .send(Query::new(
                                udsl::user
                                    .limit(1)
                                    .filter(udsl::email.eq(username))
                                    .filter(udsl::delete_token.is_null()),
                            ))
                            .from_err()
                            .and_then(move |res: QueryResult<User>| {
                                let user = res.map_err(ApiError::from_error)?
                                    .pop()
                                    .map_or(Err(ApiError::BasicAuthUserNotExists), |u| Ok(u))?;
                                let verify_result = user.validate_password(&password)
                                    .map_err(ApiError::from_error)?;
                                if !verify_result {
                                    Err(ApiError::BasicAuthPasswordMismatch)
                                } else {
                                    Ok(BasicAuth(user))
                                }
                            })
                    })
                    .map_err(|e| e.into()),
            )
        }
    }
}

mod bearer {
    use super::ApiError;
    use super::AuthHeader;
    use actix_web::http::header;
    use actix_web::{Error, FromRequest, HttpMessage, HttpRequest, Result};
    use actor::db::{Query, QueryResult};
    use chrono::Utc;
    use diesel::ExpressionMethods;
    use diesel::QueryDsl;
    use futures::future::result;
    use futures::Future;
    use model::Session;
    use state::AppState;
    use uuid::Uuid;

    #[derive(Debug, PartialEq)]
    pub struct BearerAuthHeader(pub Uuid);

    impl AuthHeader for BearerAuthHeader {
        fn from_header_value(header: &str) -> Result<Self, ApiError> {
            Uuid::parse_str(&header)
                .map_err(|_| ApiError::BearerAuthInvalidToken)
                .map(|token| BearerAuthHeader(token))
        }
        fn schema() -> &'static str {
            "Bearer"
        }
    }

    pub struct BearerAuthConfig;

    impl Default for BearerAuthConfig {
        fn default() -> Self {
            BearerAuthConfig
        }
    }

    pub struct BearerAuth(pub Session);

    impl FromRequest<AppState> for BearerAuth {
        type Config = BearerAuthConfig;
        type Result = Box<Future<Item = Self, Error = Error>>;
        fn from_request(req: &HttpRequest<AppState>, _: &Self::Config) -> Self::Result {
            use schema::session::dsl as sdsl;

            let cloned_req = req.clone();
            let header_result = req.headers()
                .get(header::AUTHORIZATION)
                .map_or(Err(ApiError::NotAuthenticated), |v| {
                    v.to_str()
                        .map_err(|_| ApiError::CorruptedAuthorizationHeader)
                })
                .and_then(BearerAuthHeader::from_header);
            Box::new(
                result(header_result)
                    .and_then(move |header| {
                        let BearerAuthHeader(token) = header;
                        cloned_req
                            .state()
                            .db
                            .send(Query::new(
                                sdsl::session
                                    .limit(1)
                                    .filter(sdsl::token.eq(token))
                                    .filter(sdsl::expires_at.ge(Utc::now())),
                            ))
                            .from_err()
                            .and_then(move |res: QueryResult<Session>| {
                                res.map_err(ApiError::from_error)?
                                    .pop()
                                    .map_or(Err(ApiError::BearerAuthInvalidToken), |u| {
                                        Ok(BearerAuth(u))
                                    })
                            })
                    })
                    .map_err(|e| e.into()),
            )
        }
    }
}

#[cfg(test)]
mod tests {
    mod basic {
        use super::super::ApiError;
        use base64::encode;

        use super::super::AuthHeader;
        use super::super::BasicAuthHeader;

        #[test]
        fn ok() {
            assert_eq!(
                BasicAuthHeader::from_header_value(&encode("username:password")),
                Ok(BasicAuthHeader {
                    username: "username".to_owned(),
                    password: "password".to_owned()
                })
            );
        }

        #[test]
        fn no_password() {
            assert_eq!(
                BasicAuthHeader::from_header_value(&encode("username:")),
                Ok(BasicAuthHeader {
                    username: "username".to_owned(),
                    password: "".to_owned()
                })
            );
        }

        #[test]
        fn no_username() {
            assert_eq!(
                BasicAuthHeader::from_header_value(&encode(":password")),
                Ok(BasicAuthHeader {
                    username: "".to_owned(),
                    password: "password".to_owned()
                })
            );
        }

        #[test]
        fn corrupted_header_1() {
            assert_eq!(
                BasicAuthHeader::from_header_value("SOMETHING_NOT_BASE64"),
                Err(ApiError::CorruptedAuthorizationHeader)
            );
        }

        #[test]
        fn corrupted_header_2() {
            assert_eq!(
                BasicAuthHeader::from_header_value(&encode("NOT_CORRECT_HEADER")),
                Err(ApiError::CorruptedAuthorizationHeader)
            );
        }
    }

    mod bearer {
        use super::super::ApiError;
        use uuid::Uuid;

        use super::super::AuthHeader;
        use super::super::BearerAuthHeader;

        #[test]
        fn ok() {
            let uuid = Uuid::parse_str("f4077919-f141-4b22-9024-be45995f8e64").unwrap();
            assert_eq!(
                BearerAuthHeader::from_header_value(&uuid.hyphenated().to_string()),
                Ok(BearerAuthHeader(uuid))
            )
        }

        #[test]
        fn fail() {
            assert_eq!(
                BearerAuthHeader::from_header_value("SOMETHING_NOT_TOKEN"),
                Err(ApiError::BearerAuthInvalidToken)
            )
        }
    }

    mod auth_header {
        use super::super::ApiError;
        use base64::encode;
        use uuid::Uuid;

        use super::super::AuthHeader;
        use super::super::BasicAuthHeader;
        use super::super::BearerAuthHeader;

        #[test]
        fn basic() {
            assert_eq!(
                BasicAuthHeader::from_header(&format!("Basic {}", &encode("username:password"))),
                Ok(BasicAuthHeader {
                    username: "username".to_owned(),
                    password: "password".to_owned(),
                })
            );
        }

        #[test]
        fn basic_mismatch() {
            assert_eq!(
                BasicAuthHeader::from_header("Bearer 4e240c20-f95c-4adc-99c4-1a42e5492dcc"),
                Err(ApiError::InvalidAuthType)
            );
        }

        #[test]
        fn bearer() {
            let uuid = Uuid::parse_str("f4077919-f141-4b22-9024-be45995f8e64").unwrap();
            assert_eq!(
                BearerAuthHeader::from_header(&format!("Bearer {}", uuid.hyphenated().to_string())),
                Ok(BearerAuthHeader(uuid))
            )
        }

        #[test]
        fn bearer_mismatch() {
            assert_eq!(
                BearerAuthHeader::from_header(&format!("Basic {}", &encode("username:password"))),
                Err(ApiError::InvalidAuthType)
            );
        }
    }
}
