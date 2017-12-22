"use strict";

// tslint:disable:variable-name
export const password_hash_rounds = +(process.env.PASSWORD_HASH_ROUNDS || 12);
export const db_url = process.env.DB_URL || "pg://postgres@127.0.0.1:5432/sandra";
export const port = +(process.env.PORT || 3000);
export const token_expires = process.env.TOKEN_EXPIRES || "7d";
export const log_level = process.env.LOG_LEVEL || "info";
export const confirmation_expires = process.env.CONFIRMATION_EXPIRES || "2h";
