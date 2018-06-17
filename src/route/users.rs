use actix_web::{AsyncResponder, HttpRequest, HttpResponse, Json};
use actor::db::{CreateUser, CreateUserError};
use diesel::result::{DatabaseErrorKind, Error as DieselError};
use futures::Future;
use response::{ApiError, FutureResponse};
use state::AppState;

#[derive(Deserialize)]
pub struct PostAllRequest {
    pub email: String,
    pub password: String,
    pub nickname: Option<String>,
}

pub fn post_all((req, raw_data): (HttpRequest<AppState>, Json<PostAllRequest>)) -> FutureResponse {
    let data = raw_data.into_inner();
    req.state()
        .db
        .send(CreateUser {
            email: data.email,
            password: data.password,
            nickname: data.nickname,
        })
        .from_err()
        .and_then(|res| match res {
            // .header("location", user.id.hyphenated().to_string())
            Ok(user) => Ok(HttpResponse::Ok().json(user)),
            // TODO: refactor this after `if let combination` is supported
            Err(err) => Err(if let CreateUserError::DieselError(derr) = err {
                if let DieselError::DatabaseError(ek, ei) = derr {
                    if let DatabaseErrorKind::UniqueViolation = ek {
                        ApiError::DuplicatedEmail
                    } else {
                        ApiError::from_error(DieselError::DatabaseError(ek, ei))
                    }
                } else {
                    ApiError::from_error(derr)
                }
            } else {
                ApiError::from_error(err)
            }),
        })
        .responder()
}
