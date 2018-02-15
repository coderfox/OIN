"use strict";

import Router = require("koa-router");
const router = new Router();
import { Service } from "../models";
import { Serialize } from "cerialize";

router.get("/services", async (ctx) => {
  ctx.body = Serialize(await Service.find({
    skip: ctx.request.header["x-page-skip"] || ctx.request.query.skip || 0,
    take: ctx.request.header["x-page-limit"] || ctx.request.query.take || 50,
  }));
});

export default router;
