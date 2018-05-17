// tslint:disable:variable-name
export const password_hash_rounds = +(process.env.PASSWORD_HASH_ROUNDS || 12);
export const db_url = process.env.DB_URL || "pg://postgres@127.0.0.1:5432/sandra";
export const port = +(process.env.PORT || 3000);
export const token_expires = process.env.TOKEN_EXPIRES || "7d";
export const log_level = process.env.LOG_LEVEL || "info";
export const confirmation_expires = process.env.CONFIRMATION_EXPIRES || "2h";
export const deploy_token = process.env.DEPLOY_TOKEN || "1b26f5e2fd217297a50e5a31aeedc48a";
export const debug = process.env.NODE_ENV === "dev";
export const sentry_dsn = process.env.SENTRY_DSN || "";
