"use strict";

import Router = require("koa-router");
const router = new Router();

import session from "./session";
import users from "./users";
import confirmations from "./confirmation";
import messages from "./messages";
import rpc from "./rpc";
import services from "./services";

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
router.use(
  rpc.routes(),
  rpc.allowedMethods(),
);
router.use(
  services.routes(),
  services.allowedMethods(),
);

export default router;
