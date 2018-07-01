use super::super::auth::BearerAuth;
use super::super::response::{ApiError, FutureResponse};
use actix_web::{AsyncResponder, HttpResponse, Json, Path, Query};
use diesel::{ExpressionMethods, QueryDsl};
use futures::Future;
use model::{Message, MessageChangeset, MessageView, Session, Subscription};
use state::State;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct GetMultiQuery {
    query: Option<String>,
}

pub fn get_mine(
    (state, BearerAuth(session), url_query): (State, BearerAuth, Query<GetMultiQuery>),
) -> FutureResponse {
    // TODO: do not return `content`
    state
        .query_messages(
            url_query
                .into_inner()
                .query
                .unwrap_or("readed:false".to_string()),
            session.user_id,
        )
        .map(|results: Vec<(Message, Subscription)>| {
            HttpResponse::Ok()
                .json::<Vec<MessageView>>(results.into_iter().map(|item| item.into()).collect())
        })
        .responder()
}

fn single_from_req(
    state: &State,
    session: Session,
    uuid: Uuid,
) -> impl Future<Item = (Message, Subscription), Error = ApiError> {
    let query = {
        use schema::message;
        use schema::subscription;

        message::table
            .filter(message::id.eq(uuid))
            .inner_join(subscription::table)
    };

    state
        .query_single_optional(query)
        .and_then(
            move |result: Option<(Message, Subscription)>| match result {
                Some((message, subscription)) => if subscription.owner_id == session.user_id {
                    Ok((message, subscription))
                } else {
                    Err(ApiError::InsufficientPermission)
                },
                None => Err(ApiError::MessageNotFound),
            },
        )
}

pub fn get_one(
    (state, BearerAuth(session), uuid): (State, BearerAuth, Path<Uuid>),
) -> FutureResponse {
    single_from_req(&state, session, uuid.into_inner())
        .map(|result| HttpResponse::Ok().json::<MessageView>(result.into()))
        .responder()
}

pub fn mark_readed(
    (state, BearerAuth(session), uuid, json_body): (
        State,
        BearerAuth,
        Path<Uuid>,
        Json<MessageChangeset>,
    ),
) -> FutureResponse {
    // TODO: only return partial
    single_from_req(&state, session, uuid.into_inner())
        .map(move |(m, s)| {
            use diesel;
            use diesel::query_builder::AsQuery;
            use schema::message::dsl::*;
            state
                .query_single(
                    diesel::update(message)
                        .filter(id.eq(m.id))
                        .set(json_body.into_inner())
                        .as_query(),
                )
                .map(|m: Message| (m, s))
        })
        .flatten()
        .map(|result| HttpResponse::Ok().json::<MessageView>(result.into()))
        .responder()
}
