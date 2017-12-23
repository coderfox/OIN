"use strict";

import Router = require("koa-router");
const router = new Router();
import { authBearer } from "../lib/auth";
import Message from "../models/message";
import * as Errors from "../lib/errors";

router.get("/me/messages", async (ctx) => {
  const session = await authBearer(ctx);
  const messages = await session.user.messages;
  ctx.body = messages.map((value) => {
    value.owner = session.user;
    return value.toViewSimplified();
  });
});
router.get("/messages/:id", async (ctx) => {
  const session = await authBearer(ctx);
  const message = await Message.findOneById(ctx.params.id);
  if (!message) {
    throw new Errors.MessageNotExistsError(ctx.params.id);
  } else {
    if (message.owner !== session.user && !session.permissions.admin) {
      throw new Errors.InsufficientPermissionError(session, "admin");
    } else {
      ctx.body = message.toView();
    }
  }
});

export default router;
