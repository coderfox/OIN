use super::response::{ApiError, FutureResponse, RpcResponse};
use actix_web::{AsyncResponder, Json};
use actor::db::ActorQuery;
use config::DEPLOY_TOKEN;
use diesel;
use diesel::query_builder::AsQuery;
use diesel::{ExpressionMethods, QueryDsl};
use futures::future::{err, ok};
use futures::Future;
use model::{NewMessage, NewService, NewSubscriptionEvent, Subscription};
use state::State;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct RegisterServiceParam {
    pub metadata: NewService,
    pub deploy_token: String,
}

pub fn register_service(
    (state, param_json): (State, Json<RegisterServiceParam>),
) -> FutureResponse<Uuid> {
    let param = param_json.into_inner();
    (if param.deploy_token != *DEPLOY_TOKEN {
        err(ApiError::InsufficientPermission)
    } else {
        ok(())
    }).and_then(move |_| {
        state.query_single({
            use schema::service::dsl::{id, service, token};
            diesel::insert_into(service)
                .values(param.metadata.clone())
                .on_conflict(id)
                .do_update()
                .set(param.metadata)
                .returning(token)
                .as_query()
        })
    })
        .map(|result: Uuid| RpcResponse::new(result))
        .responder()
}

#[derive(Serialize)]
pub struct ChannelView {
    pub id: Uuid,
    pub config: String,
}

impl Into<ChannelView> for Subscription {
    fn into(self) -> ChannelView {
        ChannelView {
            id: self.id,
            config: self.config,
        }
    }
}

#[derive(Deserialize)]
pub struct GetChannelsParam {
    pub token: Uuid,
}

pub fn get_channels(
    (state, param_json): (State, Json<GetChannelsParam>),
) -> FutureResponse<Vec<ChannelView>> {
    let param = param_json.into_inner();
    state
        .query_single_optional({
            use schema::service::dsl::*;
            service.filter(token.eq(param.token)).select(id)
        })
        .and_then(|result: Option<Uuid>| match result {
            Some(val) => Ok(val),
            None => Err(ApiError::InsufficientPermission),
        })
        .and_then(move |id| {
            state.query({
                use schema::subscription::dsl::{deleted, service_id, subscription};
                subscription
                    .filter(service_id.eq(id))
                    .filter(deleted.eq(false))
            })
        })
        .map(|channels: Vec<Subscription>| {
            RpcResponse::new(channels.into_iter().map(|c| c.into()).collect())
        })
        .responder()
}

#[derive(Deserialize)]
pub struct CreateMessageParamMessage {
    pub title: String,
    pub summary: Option<String>,
    pub content: String,
    pub href: Option<String>,
}

#[derive(Deserialize)]
pub struct CreateMessageParam {
    pub token: Uuid,
    pub channel_id: Uuid,
    pub message: CreateMessageParamMessage,
}

pub fn create_message(
    (state, param_json): (State, Json<CreateMessageParam>),
) -> FutureResponse<bool> {
    let param = param_json.into_inner();
    state
        .query_single_optional({
            use schema::{service, subscription};
            subscription::table
                .inner_join(service::table)
                .filter(subscription::id.eq(param.channel_id))
                .filter(service::token.eq(param.token))
                .select(subscription::id)
        })
        .and_then(|result: Option<Uuid>| match result {
            Some(val) => Ok(val),
            None => Err(ApiError::InsufficientPermission),
        })
        .and_then(move |subscription_id| {
            state.query_single({
                use schema::message::dsl::{id, message};
                diesel::insert_into(message)
                    .values(NewMessage {
                        title: param.message.title,
                        summary: param
                            .message
                            .summary
                            .unwrap_or(param.message.content.clone()),
                        content: param.message.content,
                        href: param.message.href,
                        subscription_id,
                    })
                    .returning(id)
                    .as_query()
            })
        })
        .map(|_: Uuid| RpcResponse::new(true))
        .responder()
}

#[derive(Deserialize)]
pub struct ReportEventParamEvent {
    pub status: bool,
    pub message: Option<String>,
}

#[derive(Deserialize)]
pub struct ReportEventParam {
    pub token: Uuid,
    pub channel_id: Uuid,
    pub event: ReportEventParamEvent,
}

pub fn report_event((state, param_json): (State, Json<ReportEventParam>)) -> FutureResponse<bool> {
    let param = param_json.into_inner();
    state
        .query_single_optional({
            use schema::{service, subscription};
            subscription::table
                .inner_join(service::table)
                .filter(subscription::id.eq(param.channel_id))
                .filter(service::token.eq(param.token))
                .select(subscription::id)
        })
        .and_then(|result: Option<Uuid>| match result {
            Some(val) => Ok(val),
            None => Err(ApiError::InsufficientPermission),
        })
        .and_then(move |subscription_id| {
            state.query_single({
                use schema::subscription_event::dsl::{id, subscription_event};
                diesel::insert_into(subscription_event)
                    .values(NewSubscriptionEvent {
                        status: param.event.status,
                        message: param
                            .event
                            .message
                            .unwrap_or(param.event.status.to_string()),
                        subscription_id,
                    })
                    .returning(id)
                    .as_query()
            })
        })
        .map(|_: Uuid| RpcResponse::new(true))
        .responder()
}
