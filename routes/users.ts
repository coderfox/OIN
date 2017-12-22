"use strict";

import Router = require("koa-router");
const router = new Router();
import { User, Confirmation } from "../models";
import { Operations as ConfirmationOperations } from "../models/confirmation";
import * as Errors from "../lib/errors";
import { authBasic, authBearer } from "../lib/auth";
import { Serialize } from "cerialize";

router.get("/users", async (ctx) => {
  const session = await authBearer(ctx);
  if (!session.permissions.admin) {
    throw new Errors.InsufficientPermissionError(session, "admin");
  }
  ctx.body = Serialize(await User.find({
    skip: ctx.request.header["x-page-skip"] || ctx.request.query.skip || 0,
    take: ctx.request.header["x-page-limit"] || ctx.request.query.take || 50,
  }));
});
router.post("/users", async (ctx) => {
  if (!ctx.request.body.email || !ctx.request.body.password) {
    throw new Errors.BadRequestError(ctx);
  }
  const presentUser = await User.findOne({
    email: ctx.request.body.email,
  });
  if (presentUser && !presentUser.deleteToken) {
    throw new Errors.DuplicateEmailError(ctx.request.body.email);
  }
  const confirmation = new Confirmation({
    operation: ConfirmationOperations.Register,
    data: {
      email: ctx.request.body.email,
      hashedPassword: await User.hashPassword(ctx.request.body.password),
    },
  });
  await confirmation.save();
  // TODO: send email
  // TODO: if confirmation with the
  //       specified email exists, do not create a new one
  ctx.status = 202;
  ctx.body = {};
});
router.use("/users/:id", async (ctx, next) => {
  const user = await User.findOneById(ctx.params.id);
  if (user && !user.deleteToken) {
    ctx.params.user = user;
    await next();
  } else {
    throw new Errors.UserNotFoundByIdError(ctx.params.id);
  }
});
router.get("/users/:id", async (ctx) => {
  const session = await authBearer(ctx);
  if (ctx.params.id !== session.user.id && !session.permissions.admin) {
    throw new Errors.InsufficientPermissionError(session, "admin");
  } else {
    ctx.body = ctx.params.user.toView();
  }
});
router.post("/users/:id", async (ctx) => {
  const modify = async (requireNewEmailConfirmation: boolean) => {
    if (ctx.request.body.email) {
      if (!requireNewEmailConfirmation) {
        ctx.params.user.email = ctx.request.body.email;
        await ctx.params.user.save();
      } else {
        const confirmation = new Confirmation({
          operation: ConfirmationOperations.UpdateEmail, data: {
            uid: ctx.params.user.id,
            newEmail: ctx.request.body.email,
          },
        });
        await confirmation.save();
        ctx.status = 202;
      }
    } else if (ctx.request.body.password) {
      ctx.params.user.setPassword(ctx.request.body.password);
      await ctx.params.user.save();
    } else {
      throw new Errors.NewEmailOrPasswordNotSuppliedError();
    }
    ctx.body = ctx.params.user.toView();
  };
  const userAction = async () => {
    const user = await authBasic(ctx);
    if (ctx.params.id !== user.id) {
      throw new Errors.InvalidAuthenticationTypeError("Basic", "Bearer");
    }
    await modify(true);
  };
  const adminAction = async () => {
    const session = await authBearer(ctx);
    if (!session.permissions.admin) {
      throw new Errors.InsufficientPermissionError(session, "admin");
    }
    await modify(false);
  };
  try {
    await userAction();
  } catch (err) {
    if (err instanceof Errors.InvalidAuthenticationTypeError) {
      await adminAction();
    } else {
      throw err;
    }
  }
});
router.delete("/users/:id", async (ctx) => {
  const modify = async () => {
    ctx.params.user.markDeleted();
    await ctx.params.user.save();
    ctx.body = ctx.params.user.toView();
  };
  const userAction = async () => {
    const user = await authBasic(ctx);
    if (ctx.params.id !== user.id) {
      throw new Errors.InvalidAuthenticationTypeError("Basic", "Bearer");
    }
    await modify();
  };
  const adminAction = async () => {
    const session = await authBearer(ctx);
    if (!session.permissions.admin) {
      throw new Errors.InsufficientPermissionError(session, "admin");
    }
    await modify();
  };
  try {
    await userAction();
  } catch (err) {
    if (err instanceof Errors.InvalidAuthenticationTypeError) {
      await adminAction();
    } else {
      throw err;
    }
  }
});

export default router;
