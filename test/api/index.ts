"use strict";

import common from "./common";
import session from "./session";
import users from "./users";
import messages from "./messages";
import rpc from "./rpc";
import services from "./services";

export default async () => {
  describe("common", common);
  describe("session", session);
  describe("users", users);
  describe("messages", messages);
  describe("rpc", rpc);
  describe("services", services);
};
