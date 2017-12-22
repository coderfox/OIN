"use strict";

import Router = require("koa-router");
const router = new Router();
import { User, Confirmation } from "../models";
import { Operations as ConfirmationOperations } from "../models/confirmation";
import * as ConfirmationTypes from "../models/confirmation";
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
router.put("/confirmations/:code", async (ctx) => {
  try {
    const confirmation = await Confirmation.findOneById(ctx.params.code);
    if (!confirmation || confirmation.expired) {
      throw new Errors.ConfirmationNotFoundError(ctx.params.code);
    }
    switch (confirmation.operation) {
      case ConfirmationOperations.Register: {
        const data = confirmation.data as ConfirmationTypes.IRegisterData;
        const presentUser = await User.findOne({
          email: data.email,
        });
        if (presentUser && !presentUser.deleteToken) {
          throw new Errors.ConfirmationNotFoundError(ctx.params.code);
        }
        const user = new User(data.email);
        user.hashedPassword = data.hashedPassword;
        await user.save();
        confirmation.expiresAt = new Date();
        await confirmation.save();
        ctx.set("Location", `/users/${user.id}`);
        ctx.status = 201;
        ctx.body = user.toView();
        break;
      }
      case ConfirmationOperations.UpdateEmail: {
        const data = confirmation.data as ConfirmationTypes.IUpdateEmailData;
        const user = await User.findOneById(data.uid);
        if (user && !user.deleteToken) {
          user.email = data.newEmail;
          await user.save();
          confirmation.expiresAt = new Date();
          await confirmation.save();
          ctx.body = { confirmed: true };
        } else {
          throw new Errors.ConfirmationNotFoundError(ctx.params.code);
        }
        break;
      }
      case ConfirmationOperations.PasswordRecovery: {
        const data = confirmation.data as ConfirmationTypes.IPasswordRecoveryData;
        const user = await User.findOneById(data.uid);
        if (user && !user.deleteToken) {
          user.setPassword(data.newPassword);
          await user.save();
          confirmation.expiresAt = new Date();
          await confirmation.save();
          ctx.body = { confirmed: true };
        } else {
          throw new Errors.ConfirmationNotFoundError(ctx.params.code);
        }
        break;
      }
      default: {
        throw new Errors.NotImplementedError();
      }
    }
  } catch (err) {
    if (err && err.message &&
      err.message.includes("invalid input syntax")) {
      throw new Errors.ConfirmationNotFoundError(ctx.params.code);
    } else {
      throw err;
    }
  }
});
router.get("/users/:id", async (ctx) => {
  const session = await authBearer(ctx);
  if (ctx.params.id !== session.user.id && !session.permissions.admin) {
    const user = await User.findOneById(ctx.params.id);
    if (!user || !!user.deleteToken) {
      throw new Errors.UserNotFoundByIdError(ctx.params.id);
    } else {
      throw new Errors.InsufficientPermissionError(session, "admin");
    }
  } else {
    const user = await User.findOneById(ctx.params.id);
    if (!user || !!user.deleteToken) {
      throw new Errors.UserNotFoundByIdError(ctx.params.id);
    }
    ctx.body = user.toView();
  }
});
router.post("/users/:id", async (ctx) => {
  const modify = async (user: User | undefined, requireNewEmailConfirmation: boolean) => {
    if (!user || !!user.deleteToken) {
      throw new Errors.UserNotFoundByIdError(ctx.params.id);
    }
    if (ctx.body.email) {
      if (!requireNewEmailConfirmation) {
        user.email = ctx.body.email;
        await user.save();
      } else {
        const confirmation = new Confirmation({
          operation: ConfirmationOperations.UpdateEmail, data: {
            uid: user.id,
            newEmail: ctx.request.body.email,
          },
        });
        await confirmation.save();
        ctx.status = 202;
      }
    } else if (ctx.body.password) {
      user.setPassword(ctx.body.password);
      await user.save();
    } else {
      throw new Errors.NewEmailOrPasswordNotSuppliedError();
    }
    ctx.body = user.toView();
  };
  const userAction = async () => {
    const user = await authBasic(ctx);
    if (ctx.params.id !== user.id) {
      throw new Errors.AuthenticationNotFoundError(ctx, "Bearer");
    }
    await modify(user, true);
  };
  const adminAction = async () => {
    const session = await authBearer(ctx);
    if (!session.permissions.admin) {
      throw new Errors.InsufficientPermissionError(session, "admin");
    }
    const user = await User.findOneById(ctx.params.id);
    await modify(user, false);
  };
  try {
    await userAction();
  } catch (err) {
    if (err instanceof Errors.AuthenticationNotFoundError) {
      await adminAction();
    } else {
      throw err;
    }
  }
});
router.post("/users/:id/confirmations", async (ctx) => {
  const user = await User.findOneById(ctx.params.id);
  if (!user || !!user.deleteToken) {
    throw new Errors.UserNotFoundByIdError(ctx.params.id);
  }
  if (!ctx.request.body.password) {
    throw new Errors.PasswordNotSuppliedError();
  }
  const confirmation = new Confirmation({
    operation: ConfirmationOperations.PasswordRecovery, data: {
      uid: user.id,
      newPassword: ctx.request.body.password,
    },
  });
  await confirmation.save();
  ctx.status = 202;
  ctx.body = {};
});
router.delete("/user/:id", async (ctx) => {
  const modify = async (user: User | undefined) => {
    if (!user || !!user.deleteToken) {
      throw new Errors.UserNotFoundByIdError(ctx.params.id);
    }
    user.markDeleted();
    await user.save();
    ctx.body = user.toView();
  };
  const userAction = async () => {
    const user = await authBasic(ctx);
    if (ctx.params.id !== user.id) {
      throw new Errors.AuthenticationNotFoundError(ctx, "Bearer");
    }
    await modify(user);
  };
  const adminAction = async () => {
    const session = await authBearer(ctx);
    if (!session.permissions.admin) {
      throw new Errors.InsufficientPermissionError(session, "admin");
    }
    const user = await User.findOneById(ctx.params.id);
    await modify(user);
  };
  try {
    await userAction();
  } catch (err) {
    if (err instanceof Errors.AuthenticationNotFoundError) {
      await adminAction();
    } else {
      throw err;
    }
  }
});

export default router;
