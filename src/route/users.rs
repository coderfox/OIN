use actix_web::{AsyncResponder, HttpRequest, HttpResponse};
use actor::db::CreateUser;
use failure::Fail;
use futures::Future;
use response::{ApiError, FutureResponse};
use state::AppState;

pub fn post_all(req: HttpRequest<AppState>) -> FutureResponse {
    req.state()
        .db
        .send(CreateUser {
            email: "i@xfox.me".to_owned(),
            password: "test".to_owned(),
            nickname: Some("coderfox".to_owned()),
        })
        .map_err(|e| ApiError::from_error_boxed(Box::new(e.compat())))
        .and_then(|res| match res {
            Ok(user) => Ok(HttpResponse::Ok().json(user)),
            Err(err) => Err(ApiError::from_error_boxed(Box::new(err))),
        })
        .responder()
}
