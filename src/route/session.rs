use actix_web::{AsyncResponder, HttpRequest, HttpResponse, Json};
use actor::db::{Query, QueryResult};
use chrono::{Duration, Utc};
use diesel;
use diesel::query_builder::AsQuery;
use diesel::result::Error as DieselError;
use diesel::ExpressionMethods;
use diesel::QueryDsl;
use failure::Fail;
use futures::Future;
use model::User;
use model::{NewSession, Session, SessionView};
use response::{ApiError, FutureResponse};
use state::AppState;

#[derive(Deserialize)]
pub struct PostRequest {
    pub email: String,
    pub password: String,
}

// TODO: drop this
pub fn post_body((req, raw_data): (HttpRequest<AppState>, Json<PostRequest>)) -> FutureResponse {
    use schema::session::dsl as sdsl;
    use schema::user::dsl as udsl;

    let PostRequest { email, password } = raw_data.into_inner();
    req.state()
        .db
        .send(Query::new(
            udsl::user.limit(1).filter(udsl::email.eq(email)),
        ))
        .map_err(|e| ApiError::from_error(e.compat()))
        .and_then(move |res: QueryResult<User>| {
            let user = res.map_err(ApiError::from_error)?
                .pop()
                .map_or(Err(ApiError::BasicAuthUserNotExists), |u| Ok(u))?;
            let verify_result = user.validate_password(&password)
                .map_err(ApiError::from_error)?;
            if !verify_result {
                Err(ApiError::BasicAuthPasswordMismatch)
            } else {
                Ok(user)
            }
        })
        .and_then(move |user| {
            req.state()
                .db
                .send(Query::new(
                    diesel::insert_into(sdsl::session)
                        .values(NewSession {
                            user_id: user.id,
                            expires_at: Utc::now() + Duration::days(7),
                        })
                        .as_query(),
                ))
                .map_err(|e| ApiError::from_error_boxed(Box::new(e.compat())))
                .map(|v| v.map(|ss| (ss, user)))
        })
        .and_then(|res: Result<(Vec<Session>, User), DieselError>| {
            let (mut sessions, user) = res.map_err(ApiError::from_error)?;
            let session = sessions
                .pop()
                .map_or(Err(ApiError::InternalServerErrorWithoutReason), |s| Ok(s))?;
            Ok(HttpResponse::Ok().json(SessionView {
                token: &session.token,
                user: &user,
                created_at: &session.created_at,
                updated_at: &session.updated_at,
                expires_at: &session.expires_at,
            }))
        })
        .responder()
}
