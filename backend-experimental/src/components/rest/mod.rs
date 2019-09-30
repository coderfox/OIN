mod auth;
mod error;
mod pagination;
mod response;
mod routes;

use super::{server_agent, LogError};
use actix::prelude::{Addr, Syn};
use actix_web::{
    http, middleware::{cors, DefaultHeaders, ErrorHandlers}, App,
};
use actor::db::DbExecutor;
use state::AppState;

pub fn build_app(addr: Addr<Syn, DbExecutor>) -> App<AppState> {
    App::with_state(AppState { db: addr })
        .prefix("/rest")
        .middleware(DefaultHeaders::new().header(
            "Server",
            format!("{} {}", server_agent(), "REST/0.5.0").as_str(),
        ))
        .middleware(LogError)
        .middleware(
            ErrorHandlers::new()
                .handler(http::StatusCode::INTERNAL_SERVER_ERROR, error::render_500)
                .handler(http::StatusCode::BAD_REQUEST, error::render_400)
                .handler(http::StatusCode::NOT_FOUND, error::render_404),
        )
        .configure(|app| {
            use self::routes::*;

            cors::Cors::for_app(app)
                .supports_credentials()
                .resource("/users", |r| {
                    r.post().with(users::post_all);
                })
                .resource("/users/me", |r| {
                    r.get().with(users::get_me);
                })
                .resource("/session", |r| {
                    r.name("session");
                    r.get().with(session::get);
                    r.delete().with(session::delete);
                })
                .resource("/sessions", |r| {
                    r.name("sessions");
                    r.post().with(session::post);
                })
                .resource("/messages/mine", |r| {
                    r.name("messages/mine");
                    r.get().with(messages::get_mine);
                })
                .resource("/messages/{id}", |r| {
                    r.get().with(messages::get_one);
                    r.post().with(messages::mark_readed);
                })
                .resource("/subscriptions/mine", |r| {
                    r.name("subscriptions/mine");
                    r.get().with(subscriptions::get_mine);
                })
                .resource("/subscriptions/{id}", |r| {
                    r.name("subscription");
                    r.get().with(subscriptions::get_one);
                    r.post().with(subscriptions::post_one);
                    r.delete().with(subscriptions::delete_one);
                })
                .resource("/subscriptions/{id}/events", |r| {
                    r.name("subscription/event");
                    r.get().with(subscriptions::get_one_events);
                })
                .resource("/subscriptions", |r| {
                    r.name("subscriptions");
                    r.post().with(subscriptions::post_all);
                })
                .resource("/services", |r| {
                    r.name("services");
                    r.get().with(services::get_all);
                })
                .resource("/services/{id}", |r| {
                    r.name("service");
                    r.get().with(services::get_one);
                })
                // TODO: `GET` /services/:id/config_validity
                .register()
        })
}
