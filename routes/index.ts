"use strict";

import Router = require("koa-router");
const router = new Router();

import session from "./session";
import users from "./users";
router.use(
  session.routes(),
  session.allowedMethods(),
);
router.use(
  users.routes(),
  users.allowedMethods(),
);

export default router;
