"use strict";

import { Context } from "koa";
import User from "../models/user";
import Session from "../models/session";
import * as Errors from "../lib/errors";
import { Errors as SessionErrors } from "../models/session";

const UuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const parseAuth = (authorization: string, required?: "Basic" | "Bearer") => {
  const indexOfSpace = authorization.indexOf(" ");
  if (indexOfSpace < 0) {
    throw new Errors.CorruptedAuthorizationHeaderError();
  }
  const type = authorization.substr(0, indexOfSpace);
  const data = authorization.substr(indexOfSpace + 1);
  if (type === "" || data === "") {
    throw new Errors.CorruptedAuthorizationHeaderError();
  }
  if (required && type !== required) {
    throw new Errors.InvalidAuthenticationTypeError(required, type);
  } else {
    return data;
  }
};
export const parseBasic = (authorization: string) => {
  const credentials = parseAuth(authorization, "Basic");
  const decoded = Buffer.from(credentials, "base64").toString();
  const indexOfColon = decoded.indexOf(":");
  if (indexOfColon < 0) {
    throw new Errors.CorruptedAuthorizationHeaderError();
  }
  const username = decoded.substr(0, indexOfColon);
  const password = decoded.substr(indexOfColon + 1);
  if (username === "" || password === "") {
    throw new Errors.CorruptedAuthorizationHeaderError();
  }
  return {
    username,
    password,
  };
};
export const parseBearer = (authorization: string) => {
  const credentials = parseAuth(authorization, "Bearer");
  if (!UuidRegExp.test(credentials)) {
    throw new Errors.TokenInvalidError(credentials);
  }
  return credentials;
};

export const authBasic = async (ctx: Context) => {
  if (!ctx.headers.authorization) {
    throw new Errors.AuthenticationNotFoundError("Basic");
  }
  const result = parseBasic(ctx.headers.authorization);
  const user = await User.findOne({
    email: result.username,
  });
  if (!user || !!user.deleteToken) {
    throw new Errors.UserNotFound403Error(result.username);
  } else {
    if (await user.checkPassword(result.password)) {
      return user;
    } else {
      throw new Errors.PasswordMismatchError(user, result.password);
    }
  }
};
export const authBearer = async (ctx: Context) => {
  if (!ctx.headers.authorization) {
    throw new Errors.AuthenticationNotFoundError("Bearer");
  }
  const token = parseBearer(ctx.headers.authorization);
  const session = await Session.findOne(token);
  if (!session) {
    throw new Errors.TokenInvalidError(token);
  } else {
    try {
      if (session.expired) {
        throw new Errors.TokenExpiredError(session);
      }
      return session;
    } catch (error) {
      if (error instanceof SessionErrors.UserNotFoundError) {
        throw new Errors.TokenInvalidError(token);
      } else if (error instanceof SessionErrors.TokenExpiredError) {
        throw new Errors.TokenExpiredError(session);
      } else {
        throw error;
      }
    }
  }
};
