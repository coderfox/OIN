"use strict";

import * as Koa from "koa";
import User from "../models/user";
import Session from "../models/session";
import { connection as db } from "../lib/db";
import parse from "../lib/parseAuth";
import { InvalidInputError, UnsupportedAuthTypeError } from "../lib/parseAuth";
import * as Errors from "../lib/errors";
import { Errors as SessionErrors } from "../models/session";

export type ICtxState = ICtxBasicState | ICtxBearerState;
export interface ICtxBasicState {
  authType: "Basic";
  user: User;
}
export interface ICtxBearerState {
  authType: "Bearer";
  user: User;
  session: Session;
}

// TODO: recognize confirmation& service
export const authUser = async (ctx: Koa.Context, required?: "Basic" | "Bearer") => {
  if (!ctx.headers.authorization) {
    throw new Errors.AuthenticationNotFoundError(ctx, required);
  }
  try {
    const parsed = parse(ctx.headers.authorization);
    ctx.state.authType = parsed.type;
    if (required && parsed.type !== required) {
      ctx.set("WWW-Authenticate", required);
      throw new Errors.InvalidAuthenticationTypeError(parsed.type, required);
    }
    switch (parsed.type) {
      case "Basic": {
        const user = await User.findOne({
          email: parsed.username,
        });
        if (!user || !!user.deleteToken) {
          throw new Errors.UserNotFound403Error(parsed.username);
        } else {
          if (await user.checkPassword(parsed.password)) {
            ctx.state.user = user;
          } else {
            throw new Errors.PasswordMismatchError(user, parsed.password);
          }
        }
        break;
      }
      case "Bearer": {
        let session;
        try {
          session = await Session.findOneById(parsed.token);
        } catch (error) {
          if (
            error &&
            error.message &&
            error.message.includes("invalid input syntax")
          ) {
            throw new Errors.TokenInvalidError(parsed.token);
          } else {
            throw error;
          }
        }
        ctx.state.session = session;
        if (!session) {
          throw new Errors.TokenInvalidError(parsed.token);
        } else {
          try {
            if (session.expired) {
              throw new Errors.TokenExpiredError(session);
            }
            ctx.state.user = session.user;
          } catch (error) {
            if (error instanceof SessionErrors.UserNotFoundError) {
              throw new Errors.TokenInvalidError(parsed.token);
            } else if (error instanceof SessionErrors.TokenExpiredError) {
              throw new Errors.TokenExpiredError(session);
            } else {
              throw error;
            }
          }
        }
        break;
      }
    }
  } catch (err) {
    if (err instanceof InvalidInputError) {
      throw new Errors.CorruptedAuthorizationHeaderError();
    } else if (err instanceof UnsupportedAuthTypeError) {
      throw new Errors.CorruptedAuthorizationHeaderError();
    } else {
      throw err;
    }
  }
};
