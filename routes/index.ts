"use strict";

import Router = require("koa-router");
const router = new Router();

import session from "./session";
import users from "./users";
import confirmations from "./confirmation";
router.use(
  session.routes(),
  session.allowedMethods(),
);
router.use(
  users.routes(),
  users.allowedMethods(),
);
router.use(
  confirmations.routes(),
  confirmations.allowedMethods(),
);

export default router;
