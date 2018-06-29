use super::super::response::{ApiError, FutureResponse};
use actix_web::{AsyncResponder, HttpResponse, Path};
use diesel::{ExpressionMethods, QueryDsl};
use futures::Future;
use model::Service;
use state::State;
use uuid::Uuid;

pub fn get_all(state: State) -> FutureResponse {
    let query = {
        use schema::service::dsl::*;
        service.order_by(updated_at.desc())
    };
    state
        .query(query)
        .map(|results: Vec<Service>| HttpResponse::Ok().json(results))
        .responder()
}

pub fn get_one((state, path): (State, Path<Uuid>)) -> FutureResponse {
    let query = {
        use schema::service::dsl::*;
        service.filter(id.eq(path.into_inner()))
    };
    state
        .query_single_optional(query)
        .and_then(|result: Option<Service>| {
            result.map_or(Err(ApiError::ServiceNotFound), |service| {
                Ok(HttpResponse::Ok().json(service))
            })
        })
        .responder()
}
