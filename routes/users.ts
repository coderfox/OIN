"use strict";

import Router = require("koa-router");
const router = new Router();
import { User, Session, Confirmation } from "../models";
import { Operations as ConfirmationOperations } from "../models/confirmation";
import { connection as db } from "../lib/db";
import * as Errors from "../lib/errors";
import { authUser } from "../lib/auth";

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
  ctx.body = (await db.getRepository(User).find({
    skip: ctx.request.header["x-page-skip"] || ctx.request.query.skip || 0,
    take: ctx.request.header["x-page-limit"] || ctx.request.query.take || 50,
  })).map((val) => val.toView());
},
);
router.post("/users", async (ctx) => {
  if (!ctx.request.body.email || !ctx.request.body.password) {
    throw new Errors.BadRequestError(ctx);
  }
  if (await db.getRepository(User).findOne({
    email: ctx.request.body.email,
  })) {
    throw new Errors.DuplicateEmailError(ctx.request.body.email);
  }
  const confirmation = new Confirmation(ConfirmationOperations.Register, {
    email: ctx.request.body.email,
    hashedPassword: await User.hashPassword(ctx.request.body.password),
  });
  db.getRepository(Confirmation).save(confirmation);
  // TODO: send email
  // TODO: if confirmation with the
  //       specified email exists, do not create a new one
  ctx.status = 202;
  ctx.body = {};
});
router.put("/confirmations/:code", async (ctx) => {
  const confirmation = await db.getRepository(Confirmation).findOneById(ctx.params.code);
  if (!confirmation || confirmation.expired) {
    throw new Errors.ConfirmationNotFoundError(ctx.params.code);
  }
  if (confirmation.operation === ConfirmationOperations.Register) {
    const user = new User(confirmation.data.email);
    user.hashedPassword = confirmation.data.hashedPassword;
    ctx.status = 201;
    ctx.body = user.toView();
  } else {
    throw new Errors.NotImplementedError();
  }
});

export default router;
