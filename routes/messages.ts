"use strict";

import Router = require("koa-router");
const router = new Router();
import { authBearer } from "../lib/auth";
import Message from "../models/message";
import * as Errors from "../lib/errors";

router.get("/me/messages", async (ctx) => {
  const session = await authBearer(ctx);
  const messages = await Message.find({
    where: {
      owner: session.user.id,
      readed: ctx.request.query.filter === "all" ? undefined : true,
    },
    skip: ctx.request.header["x-page-skip"] || ctx.request.query.skip || 0,
    take: ctx.request.header["x-page-limit"] || ctx.request.query.take || 50,
  });
  ctx.body = messages.map((value) => {
    return value.toViewSimplified();
  });
});
router.get("/messages/:id", async (ctx) => {
  const session = await authBearer(ctx);
  const message = await Message.findOneById(ctx.params.id);
  if (!message) {
    throw new Errors.MessageNotExistsError(ctx.params.id);
  } else {
    if (message.owner.id !== session.user.id && !session.permissions.admin) {
      throw new Errors.InsufficientPermissionError(session, "admin");
    } else {
      ctx.body = message.toView();
    }
  }
});
router.post("/messages/:id", async (ctx) => {
  const session = await authBearer(ctx);
  const message = await Message.findOneById(ctx.params.id);
  if (!message) {
    throw new Errors.MessageNotExistsError(ctx.params.id);
  } else {
    if (message.owner.id !== session.user.id && !session.permissions.admin) {
      throw new Errors.InsufficientPermissionError(session, "admin");
    } else {
      const { readed } = ctx.request.body;
      switch (typeof readed) {
        case "boolean": {
          message.readed = readed;
          break;
        }
        case "string": {
          message.readed = readed === "true" ? true : false;
          break;
        }
        default: {
          throw new Errors.BadRequestError(ctx);
        }
      }
      ctx.status = 206;
      ctx.body = { readed: message.readed };
    }
  }
});

export default router;
