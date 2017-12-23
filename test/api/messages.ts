"use strict";

import { assert } from "chai";
import { clearDb, request } from "../helpers";
import User from "../../models/user";
import Message from "../../models/message";
import * as uuid from "uuid/v4";
import { getManager } from "typeorm";
import Session from "../../models/session";

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
        "/me/messages",
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
  });
};
