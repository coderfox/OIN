"use strict";

import Router = require("koa-router");
const router = new Router();
import { User, Confirmation } from "../models";
import { Operations as ConfirmationOperations } from "../models/confirmation";
import * as ConfirmationTypes from "../models/confirmation";
import * as Errors from "../lib/errors";

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

export default router;
