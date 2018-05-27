export const PASSWORD_HASH_ROUNDS = +(process.env.PASSWORD_HASH_ROUNDS || 12);
export const DB_URL = process.env.DB_URL || "pg://postgres@127.0.0.1:5432/sandra";
export const PORT = +(process.env.PORT || 3000);
export const TOKEN_EXPIRES = process.env.TOKEN_EXPIRES || "7d";
export const LOG_LEVEL = process.env.LOG_LEVEL || "info";
export const DEPLOY_TOKEN = process.env.DEPLOY_TOKEN || "1b26f5e2fd217297a50e5a31aeedc48a";
export const DEBUG = process.env.NODE_ENV === "dev";
export const SENTRY_DSN = process.env.SENTRY_DSN || "";
