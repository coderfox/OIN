use super::super::response::{ApiError, FutureResponse};
use actix_web::{AsyncResponder, HttpResponse, Path, Query};
use actor::db::ActorQuery;
use diesel::{ExpressionMethods, QueryDsl, TextExpressionMethods};
use futures::Future;
use model::Service;
use state::State;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct GetAllQuery {
    pub search: Option<String>,
}

pub fn get_all((state, query): (State, Query<GetAllQuery>)) -> FutureResponse {
    ActorQuery::<_, Vec<Service>, _>::query(&*state, {
        use schema::service::dsl::*;
        service
            .order_by(updated_at.desc())
            .filter(name.like(format!(
                "%{}%",
                query.into_inner().search.unwrap_or(String::from(""))
            )))
    }).map(|results| HttpResponse::Ok().json(results))
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
