mod user;
pub use self::user::*;

mod session;
pub use self::session::*;

mod subscription;
pub use self::subscription::*;

mod subscription_event;
pub use self::subscription_event::*;

#[derive(Debug, PartialEq, DbEnum, Clone, Serialize, Deserialize)]
#[PgType = "permission"]
#[DieselType = "Permission"]
pub enum PermissionEnum {
    #[serde(rename = "admin")]
    #[db_rename = "admin"]
    Admin,
}
