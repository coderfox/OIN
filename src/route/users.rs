use actix_web::{AsyncResponder, HttpRequest, HttpResponse, Json};
use actor::db::CreateUser;
use failure::Fail;
use futures::Future;
use response::{ApiError, FutureResponse, Result};
use state::AppState;

#[derive(Deserialize)]
pub struct PostAllRequest {
    pub email: String,
    pub password: String,
    pub nickname: Option<String>,
}

pub fn post_all((req, raw_data): (HttpRequest<AppState>, Json<PostAllRequest>)) -> FutureResponse {
    let data = raw_data.into_inner();
    req.state()
        .db
        .send(CreateUser {
            email: data.email,
            password: data.password,
            nickname: data.nickname,
        })
        .map_err(|e| ApiError::from_error_boxed(Box::new(e.compat())))
        .and_then(|res| match res {
            Ok(user) => Ok(HttpResponse::Ok().json(user)),
            Err(err) => Err(ApiError::from_error_boxed(Box::new(err))),
        })
        .responder()
}

pub fn get_all(_: HttpRequest<AppState>) -> Result<&'static str> {
    Err(ApiError::UserNotFound)
}
