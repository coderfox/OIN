use super::response::ApiError;
use actix_web::http::header::HeaderName;
use actix_web::{FromRequest, HttpMessage, HttpRequest, Query, Result};
use actor::db::Pagination;
use uuid::Uuid;

pub struct PaginationConfig {
    max_limit: usize,
    default_limit: usize,
}

impl Default for PaginationConfig {
    fn default() -> Self {
        Self {
            max_limit: 50,
            default_limit: 25,
        }
    }
}

#[derive(Deserialize)]
pub struct PaginationQuery {
    limit: Option<usize>,
    until: Option<Uuid>,
}

impl<S> FromRequest<S> for Pagination {
    type Config = PaginationConfig;
    type Result = Result<Pagination, ApiError>;
    fn from_request(req: &HttpRequest<S>, config: &Self::Config) -> Self::Result {
        let query_pagination = Query::<PaginationQuery>::extract(req)
            .map_err(|_| ApiError::InvalidPagination)?
            .into_inner();
        let header_pagination = PaginationQuery {
            limit: req.headers()
                .get(HeaderName::from_static("x-pagination-limit"))
                .map(|v| {
                    v.to_str()
                        .map_err(|_| ApiError::InvalidPagination)
                        .and_then(|v| v.parse().map_err(|_| ApiError::InvalidPagination))
                })
                .map_or(Ok(None), |v| v.map(Some))?, // TODO:UPSTREAM use Option.transpose
            until: req.headers()
                .get(HeaderName::from_static("x-pagination-until"))
                .map(|v| {
                    v.to_str()
                        .map_err(|_| ApiError::InvalidPagination)
                        .and_then(|v| v.parse().map_err(|_| ApiError::InvalidPagination))
                })
                .map_or(Ok(None), |v| v.map(Some))?, // TODO:UPSTREAM use Option.transpose
        };
        Ok(Pagination {
            limit: query_pagination
                .limit
                .or(header_pagination.limit)
                .map(|v| {
                    if v > config.max_limit {
                        config.max_limit
                    } else {
                        v
                    }
                })
                .unwrap_or(config.default_limit),
            until: query_pagination.until.or(header_pagination.until),
        })
    }
}
