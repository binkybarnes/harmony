use rocket_db_pools::{sqlx, Database};

#[derive(Database)]
#[database("harmony_db")]
pub struct HarmonyDb(sqlx::PgPool);
