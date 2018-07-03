use std::env::var;

lazy_static! {
    pub static ref DEPLOY_TOKEN: String = var("SANDRA_DEPLOY_TOKEN").unwrap();
}
