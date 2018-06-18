use actix_web::{AsyncResponder, HttpRequest, HttpResponse};
use actor::db::{Query, QueryResult, QuerySingle, QuerySingleResult};
use auth::{BasicAuth, BearerAuth};
use chrono::Utc;
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

pub fn post((req, BasicAuth(user)): (HttpRequest<AppState>, BasicAuth)) -> FutureResponse {
    use schema::session::dsl as sdsl;

    req.state()
        .db
        .send(Query::new(
            diesel::insert_into(sdsl::session)
                .values(NewSession { user_id: user.id })
                .as_query(),
        ))
        .map_err(|e| ApiError::from_error_boxed(Box::new(e.compat())))
        .map(|v| v.map(|ss| (ss, user)))
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

pub fn get((req, BearerAuth(session)): (HttpRequest<AppState>, BearerAuth)) -> FutureResponse {
    use schema::user::dsl as udsl;

    req.state()
        .db
        .send(Query::new(
            udsl::user.limit(1).filter(udsl::id.eq(session.user_id)),
        ))
        .from_err()
        .and_then(move |res: QueryResult<User>| match res {
            Ok(mut users) => users
                .pop()
                .map_or(Err(ApiError::BearerAuthInvalidToken), |v| {
                    Ok(HttpResponse::Ok().json(SessionView {
                        token: &session.token,
                        user: &v,
                        created_at: &session.created_at,
                        updated_at: &session.updated_at,
                        expires_at: &session.expires_at,
                    }))
                }),
            Err(e) => Err(ApiError::from_error(e)),
        })
        .responder()
}

pub fn delete((req, BearerAuth(session)): (HttpRequest<AppState>, BearerAuth)) -> FutureResponse {
    use schema::session::dsl as sdsl;
    use schema::user::dsl as udsl;

    req.state()
        .db
        .send(QuerySingle::new(
            diesel::update(sdsl::session.find(session.token))
                .set(sdsl::expires_at.eq(Utc::now()))
                .as_query(),
        ))
        .from_err()
        .and_then(move |res: QuerySingleResult<Session>| match res {
            Ok(session) => Ok(req.state()
                .db
                .send(QuerySingle::new(
                    udsl::user.limit(1).filter(udsl::id.eq(session.user_id)),
                ))
                .from_err()
                .and_then(move |result: QuerySingleResult<User>| match result {
                    Ok(user) => Ok(HttpResponse::Ok().json(SessionView {
                        token: &session.token,
                        user: &user,
                        created_at: &session.created_at,
                        updated_at: &session.updated_at,
                        expires_at: &session.expires_at,
                    })),
                    Err(err) => Err(ApiError::from_error(err)),
                })),
            Err(err) => Err(ApiError::from_error(err)),
        })
        .flatten()
        .responder()
}
