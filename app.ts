"use strict";

import "dotenv/config";
import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as koaJson from "koa-json";
import "reflect-metadata";
import "./lib/db";
import * as Errors from "./lib/errors";
import log from "./lib/log";
import router from "./routes";

const app = new Koa();

app.use(koaJson({
  pretty: false,
}));
app.use(async (ctx, next) => {
  try {
    await next();
    if (!ctx.body) {
      throw new Errors.ApiEndpointNotFoundError();
    }
  } catch (error) {
    if (!(error instanceof Errors.ApiError)) {
      log.error(error, "internal server error");
      error = new Errors.InternalServerError(error);
    } else {
      if (error instanceof Errors.InvalidAuthenticationTypeError) {
        ctx.set("WWW-Authenticate", error.right);
      }
      log.info(error, "handled server error");
    }
    ctx.status = error.status;
    ctx.body = {
      code: error.code,
    };
  }
});
// TODO: logger
app.use(bodyParser());
app
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true,
    notImplemented: () => new Errors.NotImplementedError(),
    methodNotAllowed: () => new Errors.ApiEndpointNotFoundError(),
  }));

export default app;
