"use strict";

import Router = require("koa-router");
const router = new Router();
import { User, Session, Confirmation } from "../models";
import { Operations as ConfirmationOperations } from "../models/confirmation";
import { connection as db } from "../lib/db";
import * as Errors from "../lib/errors";
import { authUser } from "../lib/auth";
import { Serialize } from "cerialize";

interface ICtxBearerState {
  authType: "Bearer";
  user: User;
  session: Session;
}

router.get("/users", async (ctx) => {
  await authUser(ctx, "Bearer");
  const state = ctx.state as ICtxBearerState;
  if (!state.session.permissions.admin) {
    throw new Errors.InsufficientPermissionError(ctx.state.session, "admin");
  }
  ctx.body = Serialize(await db.getRepository(User).find({
    skip: ctx.request.header["x-page-skip"] || ctx.request.query.skip || 0,
    take: ctx.request.header["x-page-limit"] || ctx.request.query.take || 50,
  }));
},
);
router.post("/users", async (ctx) => {
  if (!ctx.request.body.email || !ctx.request.body.password) {
    throw new Errors.BadRequestError(ctx);
  }
  const presentUser = await db.getRepository(User).findOne({
    email: ctx.request.body.email,
  });
  if (presentUser && !presentUser.deleteToken) {
    throw new Errors.DuplicateEmailError(ctx.request.body.email);
  }
  const confirmation = new Confirmation(ConfirmationOperations.Register, {
    email: ctx.request.body.email,
    hashedPassword: await User.hashPassword(ctx.request.body.password),
  });
  await db.getRepository(Confirmation).save(confirmation);
  // TODO: send email
  // TODO: if confirmation with the
  //       specified email exists, do not create a new one
  ctx.status = 202;
  ctx.body = {};
});
router.put("/confirmations/:code", async (ctx) => {
  try {
    const confirmation = await db.getRepository(Confirmation).findOneById(ctx.params.code);
    if (!confirmation || confirmation.expired) {
      throw new Errors.ConfirmationNotFoundError(ctx.params.code);
    }
    if (confirmation.operation === ConfirmationOperations.Register) {
      const presentUser = await db.getRepository(User).findOne({ email: confirmation.data.email });
      if (presentUser && !presentUser.deleteToken) {
        throw new Errors.ConfirmationNotFoundError(ctx.params.code);
      }
      const user = new User(confirmation.data.email);
      user.hashedPassword = confirmation.data.hashedPassword;
      await db.getRepository(User).save(user);
      confirmation.expiresAt = new Date();
      await db.getRepository(Confirmation).save(confirmation);
      ctx.status = 201;
      ctx.body = user.toView();
    } else {
      throw new Errors.NotImplementedError();
    }
  } catch (err) {
    if (err && err.stack &&
      err.stack.includes("invalid input syntax for type uuid")) {
      throw new Errors.ConfirmationNotFoundError(ctx.params.code);
    } else {
      throw err;
    }
  }
});
router.get("/users/:id", async (ctx) => {
  await authUser(ctx, "Bearer");
  const state = ctx.state as ICtxBearerState;
  if (ctx.params.id !== state.user.id && !state.session.permissions.admin) {
    throw new Errors.InsufficientPermissionError(state.session, "admin");
  }
  const user = await db.getRepository(User).findOneById(ctx.params.id);
  if (!user || !!user.deleteToken) {
    throw new Errors.UserNotFoundByIdError(ctx.params.id);
  }
  ctx.body = user.toView();
});

export default router;
