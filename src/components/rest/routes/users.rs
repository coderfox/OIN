use super::super::auth::BearerAuth;
use super::super::response::{ApiError, FutureResponse};
use actix_web::{AsyncResponder, HttpRequest, HttpResponse, Json};
use actor::db::{CreateUser, CreateUserError};
use diesel::result::{DatabaseErrorKind, Error as DieselError};
use diesel::ExpressionMethods;
use diesel::QueryDsl;
use futures::Future;
use model::User;
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
            Ok(user) => Ok(HttpResponse::Created().json(user)),
            // TODO: refactor this after `if let combination` is supported
            Err(err) => Err({
                let mut is_duplicated_email = false;
                if let CreateUserError::DieselError(derr) = &err {
                    if let DieselError::DatabaseError(ek, _) = derr {
                        if let DatabaseErrorKind::UniqueViolation = ek {
                            is_duplicated_email = true;
                        }
                    }
                }
                if is_duplicated_email {
                    ApiError::DuplicatedEmail
                } else {
                    ApiError::from_error(err)
                }
            }),
        })
        .responder()
}

pub fn get_me((req, BearerAuth(session)): (HttpRequest<AppState>, BearerAuth)) -> FutureResponse {
    use schema::user::dsl;

    req.state()
        .query_single(
            dsl::user
                .find(session.user_id)
                .filter(dsl::delete_token.is_null()),
        )
        .map(|user: User| HttpResponse::Ok().json(user))
        .responder()
}
