"use strict";

import { assert } from "chai";
import { Message, User } from "../../models";
import * as uuid from "uuid/v4";
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
      assert.instanceOf(messageVS.createdAt, Date, "createdAt");
      assert.instanceOf(messageVS.updatedAt, Date, "updatedAt");
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
      assert.match(messageV.id, UuidRegExp, "id");
      assert.equal(messageV.readed, false, "readed");
      assert.match(messageV.owner, UuidRegExp, "owner");
      assert.match(messageV.subscription, UuidRegExp, "subscription");
      assert.typeOf(messageV.title, "string", "title");
      assert.typeOf(messageV.abstract, "string", "abstract");
      assert.instanceOf(messageV.createdAt, Date, "createdAt");
      assert.instanceOf(messageV.updatedAt, Date, "updatedAt");
      assert.typeOf(messageV.content.type, "string", "content.type");
      assert.typeOf(messageV.content.data, "string", "content.data");
    });
  });
};
