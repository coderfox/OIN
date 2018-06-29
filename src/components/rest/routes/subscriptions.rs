use super::super::auth::BearerAuth;
use super::super::response::{ApiError, FutureResponse};
use actix_web::{AsyncResponder, HttpResponse, Json, Path};
use diesel::{ExpressionMethods, QueryDsl};
use futures::Future;
use model::{
    NewSubscription, Session, Subscription, SubscriptionChangeset, SubscriptionEvent,
    SubscriptionView,
};
use state::State;
use uuid::Uuid;

pub fn get_mine((state, BearerAuth(session)): (State, BearerAuth)) -> FutureResponse {
    use schema::subscription::dsl as fdsl;
    use schema::subscription_event::{self, dsl as edsl};

    state
        .query(
            fdsl::subscription
                .filter(fdsl::owner_id.eq(session.user_id))
                .left_join(subscription_event::table)
                .order_by(fdsl::updated_at.desc())
                .then_order_by(fdsl::id.desc())
                .then_order_by(edsl::updated_at.desc())
                .distinct_on((fdsl::updated_at, fdsl::id)),
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
                subscription_event.filter(subscription_id.eq(subscription.id))
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
    // TODO: last_event
    single_from_req(&state, session, uuid.into_inner())
        .map(move |s| {
            use diesel;
            use diesel::query_builder::AsQuery;
            use schema::subscription::dsl::*;
            state.query_single(
                diesel::update(subscription)
                    .filter(id.eq(s.id))
                    .set(SubscriptionChangeset {
                        deleted: Some(true),
                        ..Default::default()
                    })
                    .as_query(),
            )
        })
        .flatten()
        .map(|subscription: Subscription| HttpResponse::Ok().json(subscription))
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
    // TODO: SERVICE_NOT_EXISTS
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
        .map(|subscription: Subscription| HttpResponse::Created().json(subscription))
        .responder()
}
