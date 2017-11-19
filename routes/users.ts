"use strict";

import Router = require("koa-router");
const router = new Router();
import { User, Confirmation } from "../models";
import { Operations as ConfirmationOperations } from "../models/confirmation";
import * as ConfirmationTypes from "../models/confirmation";
import { connection as db } from "../lib/db";
import * as Errors from "../lib/errors";
import { authUser, ICtxBearerState, ICtxState } from "../lib/auth";
import { Serialize } from "cerialize";

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
});
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
  const confirmation = new Confirmation({
    operation: ConfirmationOperations.Register,
    data: {
      email: ctx.request.body.email,
      hashedPassword: await User.hashPassword(ctx.request.body.password),
    },
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
    switch (confirmation.operation) {
      case ConfirmationOperations.Register: {
        const data = confirmation.data as ConfirmationTypes.IRegisterData;
        const presentUser = await db.getRepository(User).findOne({
          email: data.email,
        });
        if (presentUser && !presentUser.deleteToken) {
          throw new Errors.ConfirmationNotFoundError(ctx.params.code);
        }
        const user = new User(data.email);
        user.hashedPassword = data.hashedPassword;
        await db.getRepository(User).save(user);
        confirmation.expiresAt = new Date();
        await db.getRepository(Confirmation).save(confirmation);
        ctx.set("Location", `/users/${user.id}`);
        ctx.status = 201;
        ctx.body = user.toView();
        break;
      }
      case ConfirmationOperations.UpdateEmail: {
        const data = confirmation.data as ConfirmationTypes.IUpdateEmailData;
        const user = await db.getRepository(User).findOneById(data.uid);
        if (user && !user.deleteToken) {
          user.email = data.newEmail;
          await db.getRepository(User).save(user);
          confirmation.expiresAt = new Date();
          await db.getRepository(Confirmation).save(confirmation);
          ctx.body = { confirmed: true };
        } else {
          throw new Errors.ConfirmationNotFoundError(ctx.params.code);
        }
        break;
      }
      case ConfirmationOperations.PasswordRecovery: {
        const data = confirmation.data as ConfirmationTypes.IPasswordRecoveryData;
        const user = await db.getRepository(User).findOneById(data.uid);
        if (user && !user.deleteToken) {
          user.setPassword(data.newPassword);
          await db.getRepository(User).save(user);
          confirmation.expiresAt = new Date();
          await db.getRepository(Confirmation).save(confirmation);
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
router.post("/users/:id", async (ctx) => {
  await authUser(ctx);
  const state = ctx.state as ICtxState;
  if (state.authType === "Basic") {
    if (ctx.params.id !== state.user.id) {
      throw new Errors.AuthenticationNotFoundError(ctx, "Bearer");
    }
  } else {
    if (!state.session.permissions.admin) {
      throw new Errors.InsufficientPermissionError(state.session, "admin");
    }
  }
  const user = await db.getRepository(User).findOneById(ctx.params.id);
  if (!user || !!user.deleteToken) {
    throw new Errors.UserNotFoundByIdError(ctx.params.id);
  }
  if (ctx.body.email) {
    if (state.authType === "Bearer") {
      user.email = ctx.body.email;
      await db.getRepository(User).save(user);
    } else {
      const confirmation = new Confirmation({
        operation: ConfirmationOperations.UpdateEmail, data: {
          uid: user.id,
          newEmail: ctx.request.body.email,
        },
      });
      await db.getRepository(Confirmation).save(confirmation);
      ctx.status = 202;
    }
  } else if (ctx.body.password) {
    user.setPassword(ctx.body.password);
    await db.getRepository(User).save(user);
  } else {
    throw new Errors.NewEmailOrPasswordNotSuppliedError();
  }
  ctx.body = user.toView();
});
router.post("/users/:id/confirmations", async (ctx) => {
  const user = await db.getRepository(User).findOneById(ctx.params.id);
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
  await db.getRepository(Confirmation).save(confirmation);
  ctx.status = 202;
  ctx.body = {};
});

export default router;
