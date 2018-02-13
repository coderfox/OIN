"use strict";

import { assert } from "chai";
import { getManager } from "typeorm";
import * as uuid from "uuid/v4";
import Message from "../../models/message";
import Session from "../../models/session";
import User from "../../models/user";
import { clearDb, request } from "../helpers";

const prepareDb = async () => {
  await clearDb();
  const user = new User("user@example.com");
  await user.setPassword("user");
  await user.save();
  const session = new Session(user);
  await session.save();
  const messages = [1, 2, 3].map((value) => new Message(
    user,
    uuid(),
    `message${value}`,
    "abstract",
    "text/html",
    "content",
  ));
  await getManager().save(messages);
  return { user, session, messages };
};
export default () => {
  describe("GET /me/messages", () => {
    let messages: Message[];
    let token: string;
    let user: User;
    beforeEach(async () => {
      const { user: u, session: s, messages: m } = await prepareDb();
      user = u;
      token = s.token;
      messages = m;
    });
    it("200 OK", async () => {
      const result = await request(
        "GET /me/messages",
        "200 OK",
        { auth: { bearer: token } },
      );
      for (const id in messages) {
        if (id in messages && id in result) {
          for (const field in messages[id].toViewSimplified()) {
            if (field in messages[id].toViewSimplified() && field in result[id]) {
              const view: any = messages[id].toViewSimplified();
              assert.equal(result[id][field], view[field], `${id}#${field}`);
            }
          }
        }
      }
      for (const message of result) {
        assert.equal(message.owner, user.id);
      }
    });
    it("200 OK #pagination");
  });
  describe("GET /messages/:id", () => {
    let message: Message;
    let token: string;
    let tokenB: string;
    beforeEach(async () => {
      const { session: s, messages: m } = await prepareDb();
      token = s.token;
      message = m[0];
      const userB = new User("another@example.com");
      await userB.setPassword("b");
      await userB.save();
      const sessionB = new Session(userB);
      await sessionB.save();
      tokenB = sessionB.token;
    });
    it("200 OK", async () => {
      const result = await request(
        `GET /messages/${message.id}`,
        "200 OK",
        { auth: { bearer: token } },
      );
      for (const field in message.toViewSimplified()) {
        if (field in message.toViewSimplified() && field in result) {
          const view: any = message.toViewSimplified();
          assert.equal(result[field], view[field], field);
        }
      }
    });
    it("404 MESSAGE_NOT_EXISTS", () => request(
      `GET /messages/${uuid()}`,
      "404 MESSAGE_NOT_EXISTS",
      { auth: { bearer: token } },
    ));
    it("403 INSUFFICIENT_PERMISSION", () => request(
      `GET /messages/${message.id}`,
      "403 INSUFFICIENT_PERMISSION",
      { auth: { bearer: tokenB } },
    ));
  });
};
