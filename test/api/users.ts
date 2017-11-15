"use strict";
// tslint:disable:no-unused-expression

import { expect } from "chai";
import * as request from "request-promise-native";
import { clearDb, expectDateEquals } from "../helpers";
import { User, Session } from "../../models";
import { connection as db } from "../../lib/db";

const baseUrl = "http://127.0.0.1:3000";

export default () => {
  describe("GET /users", () => {
    let user: User;
    let session: Session;
    let sessionAdmin: Session;
    before(async () => {
      await clearDb();
      user = new User("admin@example.com");
      await user.setPassword("123456");
      user.permissions.admin = true;
      await db.getRepository(User).save(user);
      session = new Session(user);
      session.permissions.admin = false;
      sessionAdmin = new Session(user);
      sessionAdmin.permissions.admin = true;
      await db.getRepository(Session).save([session, sessionAdmin]);
    });
    after(clearDb);
    it("200 OK", async () => {
      const result = await request({
        url: `${baseUrl}/users`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        auth: {
          bearer: sessionAdmin.token,
        },
      });
      expect(result.statusCode).to.eql(200);
      expect(Array.isArray(result.body)).to.be.true;
      for (const u of result.body) {
        expect(u.id).to.be.a("string"); // TODO: validate it to be uuid
        expect(u.email).to.eql("admin@example.com");
        expect(u.permissions).to.be.not.undefined;
        expect(u.permissions.admin).to.be.true;
        expectDateEquals(u.createdAt, user.createdAt);
        expectDateEquals(u.updatedAt, user.updatedAt);
      }
    });
    it("403 INSUFFICIENT_PERMISSION", async () => {
      const result = await request({
        url: `${baseUrl}/users`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        auth: {
          bearer: session.token,
        },
      });
      expect(result.statusCode).to.eql(403);
      expect(result.body.code).to.eql("INSUFFICIENT_PERMISSION");
    });
  });
};
