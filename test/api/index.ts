"use strict";

import common from "./common";
import messages from "./messages";
import session from "./session";
import users from "./users";

export default async () => {
  describe("common", common);
  describe("session", session);
  describe("users", users);
  describe("messages", messages);
};
