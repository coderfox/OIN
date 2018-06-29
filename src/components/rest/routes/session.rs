use super::super::auth::{BasicAuth, BearerAuth};
use super::super::response::{ApiError, FutureResponse};
use actix_web::{AsyncResponder, HttpRequest, HttpResponse};
use chrono::Utc;
use diesel;
use diesel::query_builder::AsQuery;
use diesel::ExpressionMethods;
use diesel::QueryDsl;
use futures::Future;
use model::User;
use model::{NewSession, Session, SessionView};
use state::AppState;

pub fn post((req, BasicAuth(user)): (HttpRequest<AppState>, BasicAuth)) -> FutureResponse {
    // TODO: support permissions
    use schema::session::dsl as sdsl;

    req.state()
        .query_single(
            diesel::insert_into(sdsl::session)
                .values(NewSession { user_id: user.id })
                .as_query(),
        )
        .map(move |session: Session| {
            HttpResponse::Created().json::<SessionView>((&session, &user).into())
        })
        .responder()
}

pub fn get((req, BearerAuth(session)): (HttpRequest<AppState>, BearerAuth)) -> FutureResponse {
    use schema::user::dsl as udsl;

    req.state()
        .query_single(udsl::user.filter(udsl::id.eq(session.user_id)))
        .map(move |user: User| HttpResponse::Ok().json::<SessionView>((&session, &user).into()))
        .responder()
}

pub fn delete((req, BearerAuth(session)): (HttpRequest<AppState>, BearerAuth)) -> FutureResponse {
    use schema::session::dsl as sdsl;
    use schema::user::dsl as udsl;

    req.state()
        .query_single::<_, _, ApiError>(
            diesel::update(sdsl::session.find(session.token))
                .set(sdsl::expires_at.eq(Utc::now()))
                .as_query(),
        )
        .map(move |session: Session| {
            req.state()
                .query_single(udsl::user.filter(udsl::id.eq(session.user_id)))
                .map(move |user: User| {
                    HttpResponse::Ok().json::<SessionView>((&session, &user).into())
                })
        })
        .flatten()
        .responder()
}
