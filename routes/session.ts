"use strict";

import Router = require("koa-router");
const router = new Router();
import { authBasic, authBearer } from "../lib/auth";
import * as Errors from "../lib/errors";
import { Session } from "../models";

router.put("/session", async (ctx) => {
  const user = await authBasic(ctx);
  const session = new Session(user);
  if (ctx.request.body.permissions && ctx.request.body.permissions.admin) {
    if (user.permissions.admin) {
      session.permissions.admin = true;
    } else {
      throw new Errors.InsufficientPermissionError(session, "admin");
    }
  }
  await session.save();
  ctx.body = await session.toView();
});
router.get("/session", async (ctx) => {
  const session = await authBearer(ctx);
  if (session) {
    ctx.body = await session.toView();
  }
});
router.delete("/session", async (ctx) => {
  const session = await authBearer(ctx);
  if (session) {
    session.expiresAt = new Date(Date.now());
    await session.save();
    ctx.body = await session.toView(true);
  }
});

export default router;
