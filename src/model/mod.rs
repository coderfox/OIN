mod user;
pub use self::user::*;

mod session;
pub use self::session::*;

#[derive(Debug, PartialEq, DbEnum, Clone, Serialize, Deserialize)]
#[PgType = "permission"]
#[DieselType = "Permission"]
pub enum PermissionEnum {
    #[serde(rename = "admin")]
    #[db_rename = "admin"]
    Admin,
}
