mod error;
mod response;

use super::{server_agent, LogError};
use actix::prelude::{Addr, Syn};
use actix_web::{http,
                middleware::{cors, DefaultHeaders, ErrorHandlers},
                App};
use actor::db::DbExecutor;
use state::AppState;

pub fn build_app(addr: Addr<Syn, DbExecutor>) -> App<AppState> {
    App::with_state(AppState { db: addr })
        .prefix("/rpc-client")
        .middleware(DefaultHeaders::new().header(
            "Server",
            format!("{} {}", server_agent(), "RPC-Client/0.5").as_str(),
        ))
        .middleware(LogError)
        .middleware(
            ErrorHandlers::new()
                .handler(http::StatusCode::INTERNAL_SERVER_ERROR, error::render_503)
                .handler(
                    http::StatusCode::BAD_REQUEST,
                    error::render_500_invalid_parameters,
                )
                .handler(
                    http::StatusCode::NOT_FOUND,
                    error::render_500_api_endpoint_not_found,
                ),
        )
        .configure(|app| {
            cors::Cors::for_app(app)
                .supports_credentials()
                .resource("/", |r| r.f(error::not_implemented)) // TODO: drop this
                .register()
        })
        .default_resource(|r| r.f(error::not_implemented))
}
