"use strict";

import Router = require("koa-router");
const router = new Router();
import { User, Session } from "../models";
import { connection as db } from "../lib/db";
import * as Errors from "../lib/errors";
import { authUser } from "../lib/auth";

interface ICtxState {
  authType: "Basic" | "Bearer";
  user: User;
  session?: Session;
  // TODO: support confirmation& service
}

router.put("/session", async (ctx) => {
  await authUser(ctx, "Basic");
  const state = ctx.state as ICtxState;
  const session = new Session(state.user);
  if (ctx.request.body.permissions && ctx.request.body.permissions.admin) {
    if (state.user.permissions.admin) {
      session.permissions.admin = true;
    } else {
      throw new Errors.InsufficientPermissionError(session, "admin");
    }
  }
  await db.getRepository(Session).save(session);
  ctx.body = await session.toView();
});
router.get("/session", async (ctx) => {
  await authUser(ctx, "Bearer");
  const state = ctx.state as ICtxState;
  if (state.session) {
    ctx.body = await state.session.toView();
  }
});
router.delete("/session", async (ctx) => {
  await authUser(ctx, "Bearer");
  const state = ctx.state as ICtxState;
  if (state.session) {
    state.session.expiresAt = new Date(Date.now());
    await db.getRepository(Session).save(state.session);
    ctx.body = await state.session.toView(true);
  }
});

export default router;
