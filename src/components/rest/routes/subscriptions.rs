use super::super::auth::BearerAuth;
use super::super::response::FutureResponse;
use actix_web::{AsyncResponder, HttpRequest, HttpResponse};
use diesel::{ExpressionMethods, QueryDsl};
use futures::Future;
use model::{Subscription, SubscriptionEvent, SubscriptionView};
use state::AppState;

pub fn get_mine((req, BearerAuth(session)): (HttpRequest<AppState>, BearerAuth)) -> FutureResponse {
    use schema::subscription::dsl as fdsl;
    use schema::subscription_event::{self, dsl as edsl};

    req.state()
        .query(
            fdsl::subscription
                .filter(fdsl::owner_id.eq(session.user_id))
                .left_join(subscription_event::table)
                .order_by(fdsl::updated_at.desc())
                .then_order_by(fdsl::id.desc())
                .then_order_by(edsl::updated_at.desc())
                .distinct_on((fdsl::updated_at, fdsl::id)),
        )
        .map(|results: Vec<(Subscription, Option<SubscriptionEvent>)>| {
            HttpResponse::Ok().json::<Vec<SubscriptionView>>(
                results.into_iter().map(|item| item.into()).collect(),
            )
        })
        .responder()
}
