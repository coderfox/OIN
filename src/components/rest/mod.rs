mod auth;
mod error;
mod response;
mod routes;

use super::{server_agent, LogError};
use actix::prelude::{Addr, Syn};
use actix_web::{http,
                middleware::{cors, DefaultHeaders, ErrorHandlers},
                App};
use actor::db::DbExecutor;
use state::AppState;

pub fn build_app(addr: Addr<Syn, DbExecutor>) -> App<AppState> {
    App::with_state(AppState { db: addr })
        .prefix("/rest")
        .middleware(DefaultHeaders::new().header(
            "Server",
            format!("{} {}", server_agent(), "REST/0.5").as_str(),
        ))
        .middleware(LogError)
        .middleware(
            ErrorHandlers::new()
                .handler(http::StatusCode::INTERNAL_SERVER_ERROR, error::render_500)
                .handler(http::StatusCode::BAD_REQUEST, error::render_400)
                .handler(http::StatusCode::NOT_FOUND, error::render_404),
        )
        .configure(|app| {
            cors::Cors::for_app(app)
                .supports_credentials()
                .resource("/users", |r| {
                    r.post().with(routes::users::post_all);
                })
                .resource("/users/me", |r| {
                    r.get().with(routes::users::get_me);
                })
                .resource("/session", |r| {
                    r.name("session");
                    r.put().with(routes::session::post);
                    r.get().with(routes::session::get);
                    r.delete().with(routes::session::delete);
                })
                .resource("/messages/mine", |r| {
                    r.name("messages/mine");
                    r.get().with(error::not_implemented);
                })
                .resource("/messages/{id}", |r| {
                    r.get().with(error::not_implemented);
                    r.post().with(error::not_implemented);
                })
                .resource("/subscriptions/mine", |r| {
                    r.name("subscriptions/mine");
                    r.get().with(routes::subscriptions::get_mine);
                })
                .resource("/subscriptions/{id}", |r| {
                    r.name("subscription");
                    r.get().with(routes::subscriptions::get_one);
                    r.post().with(routes::subscriptions::post_one);
                    r.delete().with(routes::subscriptions::delete_one);
                })
                .resource("/subscriptions/{id}/events", |r| {
                    r.name("subscription/event");
                    r.get().with(routes::subscriptions::get_one_events);
                })
                .resource("/subscriptions", |r| {
                    r.name("subscriptions");
                    r.post().with(routes::subscriptions::post_all);
                })
                .resource("/services", |r| {
                    r.name("services");
                    r.get().with(routes::services::get_all);
                })
                .resource("/services/{id}", |r| {
                    r.name("service");
                    r.get().with(routes::services::get_one);
                })
                .register()
        })
}
