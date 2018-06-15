use actix::prelude::*;
use actix_web::{http, middleware, server, App, AsyncResponder, FutureResponse, HttpRequest,
                HttpResponse, Path, State};

use diesel::prelude::*;
use diesel::r2d2::ConnectionManager;
use futures::Future;

use db::CreateUser;
use state::AppState;

pub fn post_all(req: HttpRequest<AppState>) -> FutureResponse<HttpResponse> {
    req.state()
        .db
        .send(CreateUser {
            email: "i@xfox.me".to_owned(),
            password: "test".to_owned(),
            nickname: Some("coderfox".to_owned()),
        })
        .from_err()
        .and_then(|res| match res {
            Ok(user) => Ok(HttpResponse::Ok().json(user)),
            Err(_) => Ok(HttpResponse::InternalServerError().into()),
        })
        .responder()
}
