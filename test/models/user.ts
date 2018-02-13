"use strict";

import { expect } from "chai";
import User from "../../models/user";

export default () => {
  describe("#setPassword", () => {
    const user = new User("user@example.com");
    it("should works", () => user.setPassword("test"));
  });
  describe("#checkPassword", () => {
    const user = new User("user@example.com");
    user.setPassword("A");
    it("returns true on success", async () => {
      // tslint:disable-next-line:no-unused-expression
      expect(await user.checkPassword("A")).to.be.true;
    });
    it("returns false on failure", async () => {
      // tslint:disable-next-line:no-unused-expression
      expect(await user.checkPassword("B")).to.be.false;
    });
  });
};
