use super::super::auth::BearerAuth;
use super::super::response::{ApiError, FutureResponse};
use actix_web::{AsyncResponder, HttpResponse, Json, Path, Query};
use diesel::{
    result::{DatabaseErrorKind, Error as DieselError}, ExpressionMethods, QueryDsl,
};
use futures::Future;
use model::{
    NewSubscription, Session, Subscription, SubscriptionChangeset, SubscriptionEvent,
    SubscriptionView,
};
use state::QueryError;
use state::State;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct GetMultiQuery {
    query: Option<String>,
}

pub fn get_mine(
    (state, BearerAuth(session), query_wrapped): (State, BearerAuth, Query<GetMultiQuery>),
) -> FutureResponse {
    let query = query_wrapped.into_inner();
    state
        .query_subscriptions(
            query.query.unwrap_or(String::from("enabled:true")),
            session.user_id,
        )
        .map(|results: Vec<(Subscription, Option<SubscriptionEvent>)>| {
            HttpResponse::Ok().json::<Vec<SubscriptionView>>(
                results.into_iter().map(|item| item.into()).collect(),
            )
        })
        .responder()
}

fn single_from_req(
    state: &State,
    session: Session,
    uuid: Uuid,
) -> impl Future<Item = Subscription, Error = ApiError> {
    let query = {
        use schema::subscription::dsl::*;
        subscription.filter(id.eq(uuid))
    };

    state
        .query_single_optional(query)
        .and_then(move |result: Option<Subscription>| match result {
            Some(subscription) => if subscription.owner_id == session.user_id {
                Ok(subscription)
            } else {
                Err(ApiError::InsufficientPermission)
            },
            None => Err(ApiError::SubscriptionNotFound),
        })
}

fn single_from_req_with_last_event(
    state: &State,
    session: Session,
    uuid: Uuid,
) -> impl Future<Item = (Subscription, Option<SubscriptionEvent>), Error = ApiError> {
    let query = {
        use schema::subscription::dsl as fdsl;
        use schema::subscription_event::{self, dsl as edsl};
        fdsl::subscription
            .filter(fdsl::id.eq(uuid))
            .left_join(subscription_event::table)
            .order_by(edsl::updated_at.desc())
    };

    state.query_single_optional(query).and_then(
        move |result: Option<(Subscription, Option<SubscriptionEvent>)>| match result {
            Some(tuple) => if tuple.0.owner_id == session.user_id {
                Ok(tuple)
            } else {
                Err(ApiError::InsufficientPermission)
            },
            None => Err(ApiError::SubscriptionNotFound),
        },
    )
}

pub fn get_one(
    (state, BearerAuth(session), uuid): (State, BearerAuth, Path<Uuid>),
) -> FutureResponse {
    single_from_req_with_last_event(&state, session, uuid.into_inner())
        .map(|result| HttpResponse::Ok().json::<SubscriptionView>(result.into()))
        .responder()
}

pub fn get_one_events(
    (state, BearerAuth(session), uuid): (State, BearerAuth, Path<Uuid>),
) -> FutureResponse {
    single_from_req(&state, session, uuid.into_inner())
        .and_then(move |subscription| {
            let query = {
                use schema::subscription_event::dsl::*;
                subscription_event
                    .filter(subscription_id.eq(subscription.id))
                    .order_by(updated_at.desc())
            };
            state.query(query)
        })
        .map(|events: Vec<SubscriptionEvent>| HttpResponse::Ok().json(events))
        .responder()
}

#[derive(Deserialize)]
pub struct PostOneBody {
    pub config: Option<String>,
    pub name: Option<String>,
}

pub fn post_one(
    (state, BearerAuth(session), uuid, json_body): (
        State,
        BearerAuth,
        Path<Uuid>,
        Json<PostOneBody>,
    ),
) -> FutureResponse {
    // TODO: INVALID_CONFIG
    let body = json_body.into_inner();

    single_from_req(&state, session, uuid.into_inner())
        .map(move |s| {
            use diesel;
            use diesel::query_builder::AsQuery;
            use schema::subscription::dsl::*;
            state.query_single(
                diesel::update(subscription)
                    .filter(id.eq(s.id))
                    .set(SubscriptionChangeset {
                        name: body.name,
                        config: body.config,
                        ..Default::default()
                    })
                    .as_query(),
            )
        })
        .flatten()
        .map(|subscription: Subscription| HttpResponse::PartialContent().json(subscription))
        .responder()
}

pub fn delete_one(
    (state, BearerAuth(session), uuid): (State, BearerAuth, Path<Uuid>),
) -> FutureResponse {
    single_from_req_with_last_event(&state, session, uuid.into_inner())
        .map(move |(s, e)| {
            use diesel;
            use diesel::query_builder::AsQuery;
            use schema::subscription::dsl::*;
            state
                .query_single(
                    diesel::update(subscription)
                        .filter(id.eq(s.id))
                        .set(SubscriptionChangeset {
                            deleted: Some(true),
                            ..Default::default()
                        })
                        .as_query(),
                )
                .map(|s| (s, e))
        })
        .flatten()
        .map(|result| HttpResponse::Ok().json::<SubscriptionView>(result.into()))
        .responder()
}

#[derive(Deserialize)]
pub struct PostAllBody {
    pub service: Uuid,
    pub config: String,
    pub name: Option<String>,
}

pub fn post_all(
    (state, BearerAuth(session), json_body): (State, BearerAuth, Json<PostAllBody>),
) -> FutureResponse {
    // TODO: `Location` header
    // TODO: INVALID_CONFIG
    let body = json_body.into_inner();
    let query = {
        use diesel;
        use diesel::query_builder::AsQuery;
        use schema::subscription::dsl::subscription;

        diesel::insert_into(subscription)
            .values(NewSubscription {
                service_id: body.service,
                config: body.config,
                owner_id: session.user_id,
                name: body.name.unwrap_or("新订阅".to_string()),
            })
            .as_query()
    };
    state
        .query_single(query)
        .map_err(|e| {
            if let QueryError::DieselError(DieselError::DatabaseError(
                DatabaseErrorKind::ForeignKeyViolation,
                _,
            )) = e
            {
                ApiError::ServiceNotExists
            } else {
                e.into()
            }
        })
        .map(|subscription: Subscription| HttpResponse::Created().json(subscription))
        .responder()
}
