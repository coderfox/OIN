import { createParamDecorator } from "@nestjs/common";
import * as Errors from "../lib/errors";
import { parseBearer, parseBasic } from "../lib/auth";
import { Session, User } from "../models";
import { Errors as SessionErrors } from "../models/session";

export const SessionAuth = createParamDecorator(async (_, req) => {
  if (!req.headers.authorization) {
    throw new Errors.AuthenticationNotFoundError("Bearer");
  }
  const token = parseBearer(req.headers.authorization);
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
});
export const BasicAuth = createParamDecorator(async (_, req) => {
  if (!req.headers.authorization) {
    throw new Errors.AuthenticationNotFoundError("Basic");
  }
  const result = parseBasic(req.headers.authorization);
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
});
