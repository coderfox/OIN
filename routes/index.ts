"use strict";

import Router = require("koa-router");
const router = new Router();

import confirmations from "./confirmation";
import messages from "./messages";
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
router.use(
  confirmations.routes(),
  confirmations.allowedMethods(),
);
router.use(
  messages.routes(),
  messages.allowedMethods(),
);

export default router;
