"use strict";

import Router = require("koa-router");
const router = new Router();
import { Service } from "../models";
import log from "../lib/log";
import { deploy_token as deploy_token_config } from "../lib/config";
import * as Errors from "../lib/errors";

router.use(async (ctx, next) => {
  try {
    await next();
    ctx.body = { result: ctx.body };
  } catch (err) {
    if (err instanceof Errors.RpcError) {
      throw err;
    } else {
      log.error("rpc error", err);
      throw new Errors.ApiError("SERVICE_UNAVAILABLE", 503);
    }
  }
});
router.post("/register_service", async (ctx) => {
  const { deploy_token, metadata } = ctx.request.body;
  if (!deploy_token || !metadata) {
    throw new Errors.RpcInvalidParametersError();
  }
  if (deploy_token !== deploy_token_config) {
    throw new Errors.RpcInsufficientPermissionError();
  }
  const { id, name, description } = metadata;
  if (!id || !name) {
    throw new Errors.RpcInvalidParametersError();
  }
  const service = await Service.findOneById(id);
  if (service) {
    return service.token;
  } else {
    log.info("registering new service", metadata);
    const newService = new Service();
    newService.id = id;
    newService.name = name;
    newService.description = description;
    await newService.save();
    ctx.body = newService.token;
  }
});

export default router;
