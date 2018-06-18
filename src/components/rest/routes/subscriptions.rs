use super::super::auth::BearerAuth;
use super::super::response::{ApiError, FutureResponse};
use actix_web::{AsyncResponder, HttpRequest, HttpResponse};
use actor::db::{Query, QueryResult};
use diesel::{ExpressionMethods, QueryDsl};
use futures::Future;
use model::{Subscription, SubscriptionEvent, SubscriptionView};
use state::AppState;

pub fn get_mine((req, BearerAuth(session)): (HttpRequest<AppState>, BearerAuth)) -> FutureResponse {
    use schema::subscription::dsl as fdsl;
    use schema::subscription_event::{self, dsl as edsl};

    req.state()
        .db
        .send(Query::new(
            fdsl::subscription
                .filter(fdsl::owner_id.eq(session.user_id))
                .left_join(subscription_event::table)
                .order_by(fdsl::updated_at.desc())
                .then_order_by(fdsl::id.desc())
                .then_order_by(edsl::updated_at.desc())
                .distinct_on((fdsl::updated_at, fdsl::id)),
        ))
        .from_err()
        .and_then(
            move |res: QueryResult<(Subscription, Option<SubscriptionEvent>)>| match res {
                Ok(results) => Ok(HttpResponse::Ok().json::<Vec<SubscriptionView>>(
                    results.into_iter().map(|item| item.into()).collect(),
                )),
                Err(e) => Err(ApiError::from_error(e)),
            },
        )
        .responder()
}
