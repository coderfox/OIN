"use strict";

import { assert } from "chai";
import * as uuid from "uuid/v4";
import { Message, User } from "../../models";
import { clearDb, UuidRegExp } from "../helpers";

export default () => {
  describe("#toViewSimplified", () => {
    let message: Message;
    let messageVS: any;
    before(async () => {
      await clearDb();
      message = new Message(
        new User("user@example.com"),
        uuid(),
        "example message",
        "abstract",
        "text/html",
        "some content",
      );
      await message.owner.setPassword("user");
      await message.owner.save();
      await message.save();
      messageVS = message.toViewSimplified();
    });
    it("ok", () => {
      assert.match(messageVS.id, UuidRegExp, "id");
      assert.equal(messageVS.readed, false, "readed");
      assert.match(messageVS.owner, UuidRegExp, "owner");
      assert.match(messageVS.subscription, UuidRegExp, "subscription");
      assert.typeOf(messageVS.title, "string", "title");
      assert.typeOf(messageVS.abstract, "string", "abstract");
      assert.typeOf(messageVS.createdAt, "string", "createdAt");
      assert.typeOf(messageVS.updatedAt, "string", "updatedAt");
    });
  });
  describe("#toView", () => {
    let message: Message;
    let messageV: any;
    before(async () => {
      await clearDb();
      message = new Message(
        new User("user@example.com"),
        uuid(),
        "example message",
        "abstract",
        "text/html",
        "some content",
      );
      await message.owner.setPassword("user");
      await message.owner.save();
      await message.save();
      messageV = message.toView();
    });
    it("ok", () => {
      assert.typeOf(messageV.content.type, "string", "content.type");
      assert.typeOf(messageV.content.data, "string", "content.data");
    });
  });
};
