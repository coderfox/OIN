"use strict";

import { expect } from "chai";
import * as request from "request-promise-native";
import { getRepository } from "typeorm";
import User from "../../models/user";
import Session from "../../models/session";
import { clearDb } from "../helpers";

const baseUrl = "http://127.0.0.1:3000";
const dateRegExp = /^\d{4,4}-\d{2,2}-\d{2,2}T\d{2,2}:\d{2,2}:\d{2,2}.\d{3,3}Z$/;

// tslint:disable:no-unused-expression
export default () => {
  describe("PUT /session", () => {
    const user = new User("user@example.com");
    before(async () => {
      await clearDb();
      await user.setPassword("123456");
      await getRepository(User).save(user);
    });
    after(async () => {
      await clearDb();
    });
    beforeEach(async () => {
      await getRepository(Session).clear();
    });
    it("return 200 for correct request", async () => {
      const result = await request({
        method: "PUT",
        url: `${baseUrl}/session`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        auth: {
          username: "user@example.com",
          password: "123456",
        },
      });
      expect(result.statusCode).eql(200);
      expect(result.body.token).to.be.a("string");
      {
        const us = result.body.user;
        const uv = user.toView();
        const handleDate = (str: string) => str.substr(0, str.length - 5);
        expect(us.id).to.eql(uv.id);
        expect(us.email).to.eql(uv.email);
        expect(us.permissions).to.eql(uv.permissions);
        expect(handleDate(us.created_at)).to.eql(handleDate(uv.updated_at.toJSON()));
        expect(handleDate(us.updated_at)).to.eql(handleDate(uv.updated_at.toJSON()));
      }
      expect(result.body.permissions).to.eql(["admin"]);
      expect(result.body.created_at).to.match(dateRegExp);
      expect(result.body.updated_at).to.match(dateRegExp);
      expect(result.body.expiresAt).to.match(dateRegExp);
    });
    it("return 401 for unauthorized request", async () => {
      const result = await request({
        method: "PUT",
        url: `${baseUrl}/session`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
      });
      expect(result.statusCode).eql(401);
      expect(result.body.code).eql("AUTHENTICATION_NOT_FOUND");
      expect(result.headers["www-authenticate"]).eql("Basic");
    });
    it("return 401 for unauthorized request", async () => {
      const result = await request({
        method: "PUT",
        url: `${baseUrl}/session`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        auth: {
          bearer: "SOME_TOKEN",
        },
      });
      expect(result.statusCode).eql(401);
      expect(result.body.code).eql("INVALID_AUTHENTICATION_TYPE");
      expect(result.headers["www-authenticate"]).eql("Basic");
    });
    it("return 403 for unfound email", async () => {
      const result = await request({
        method: "PUT",
        url: `${baseUrl}/session`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        auth: {
          username: "null@example.com",
          password: "123456",
        },
      });
      expect(result.statusCode).eql(403);
      expect(result.body.code).eql("USER_NOT_FOUND");
    });
    it("return 403 for wrong password", async () => {
      const result = await request({
        method: "PUT",
        url: `${baseUrl}/session`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        auth: {
          username: "user@example.com",
          password: "invalid",
        },
      });
      expect(result.statusCode).eql(403);
      expect(result.body.code).eql("PASSWORD_MISMATCH");
    });
    describe("without admin permissions", () => {
      before(async () => {
        user.permission.revoke("admin");
        await getRepository(User).save(user);
      });
      it("throws 403 on insufficient permissions", async () => {
        const result = await request({
          method: "PUT",
          url: `${baseUrl}/session`,
          simple: false,
          resolveWithFullResponse: true,
          json: true,
          auth: {
            username: "user@example.com",
            password: "123456",
          },
          body: {
            permissions: {
              admin: true,
            },
          },
        });
        expect(result.statusCode).eql(403);
        expect(result.body.code).eql("INSUFFICIENT_PERMISSION");
      });
    });
    describe("with admin permission", () => {
      before(async () => {
        user.permission.grant("admin");
        await getRepository(User).save(user);
      });
      it("defaults to false", async () => {
        const result = await request({
          method: "PUT",
          url: `${baseUrl}/session`,
          simple: false,
          resolveWithFullResponse: true,
          json: true,
          auth: {
            username: "user@example.com",
            password: "123456",
          },
        });
        expect(result.statusCode).eql(200);
        expect(result.body.permissions).to.eql([]);
      });
      it("handles permission parameter correctly", async () => {
        const result = await request({
          method: "PUT",
          url: `${baseUrl}/session`,
          simple: false,
          resolveWithFullResponse: true,
          json: true,
          auth: {
            username: "user@example.com",
            password: "123456",
          },
          body: {
            permissions: {
              admin: false,
            },
          },
        });
        expect(result.statusCode).eql(200);
        expect(result.body.permissions).to.eql([]);
      });
      it("handles permission parameter correctly", async () => {
        const result = await request({
          method: "PUT",
          url: `${baseUrl}/session`,
          simple: false,
          resolveWithFullResponse: true,
          json: true,
          auth: {
            username: "user@example.com",
            password: "123456",
          },
          body: {
            permissions: {
              admin: true,
            },
          },
        });
        expect(result.statusCode).eql(200);
        expect(result.body.permissions).to.eql(["admin"]);
      });
    });
  });
  describe("GET /session", async () => {
    let user: User;
    let session: Session;
    before(async () => {
      await clearDb();
      user = new User("user@example.com");
      await user.setPassword("123456");
      await getRepository(User).save(user);
      session = new Session(user);
      await getRepository(Session).save(session);
    });
    after(async () => {
      await clearDb();
    });
    it("200 OK", async () => {
      const result = await request({
        method: "GET",
        url: `${baseUrl}/session`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        auth: {
          bearer: session.token,
        },
      });
      expect(result.statusCode).eql(200);
      expect(result.body.token).to.be.a("string");
      {
        const us = result.body.user;
        const uv = user.toView();
        const handleDate = (str: string) => str.substr(0, str.length - 5);
        expect(us.id).to.eql(uv.id);
        expect(us.email).to.eql(uv.email);
        expect(us.permissions).to.eql(uv.permissions);
        expect(handleDate(us.created_at)).to.eql(handleDate(uv.updated_at.toJSON()));
        expect(handleDate(us.updated_at)).to.eql(handleDate(uv.updated_at.toJSON()));
      }
      expect(result.body.permissions).to.eql([]);
      expect(result.body.created_at).to.match(dateRegExp);
      expect(result.body.updated_at).to.match(dateRegExp);
      expect(result.body.expiresAt).to.match(dateRegExp);
    });
    it("403 EXPIRED_TOKEN", async () => {
      session.expiresAt = new Date(Date.now());
      await getRepository(Session).save(session);
      const result = await request({
        method: "GET",
        url: `${baseUrl}/session`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        auth: {
          bearer: session.token,
        },
      });
      expect(result.statusCode).eql(403);
      expect(result.body.code).to.eql("EXPIRED_TOKEN");
    });
    it("403 EXPIRED_TOKEN on user deleted from database", async () => {
      user.markDeleted();
      await getRepository(User).save(user);
      session.renew();
      await getRepository(Session).save(session);
      const result = await request({
        method: "GET",
        url: `${baseUrl}/session`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        auth: {
          bearer: session.token,
        },
      });
      expect(result.statusCode).eql(403);
      expect(result.body.code).to.eql("EXPIRED_TOKEN");
      // restore user
      user.deleteToken = undefined;
      await getRepository(User).save(user);
    });
    it("403 INVALID_TOKEN on empty token", async () => {
      const result = await request({
        method: "GET",
        url: `${baseUrl}/session`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        auth: {
          bearer: "",
        },
      });
      expect(result.statusCode).eql(400);
      expect(result.body.code).to.eql("CORRUPTED_AUTHORIZATION_HEADER");
    });
    it("403 INVALID_TOKEN on wrong token", async () => {
      const result = await request({
        method: "GET",
        url: `${baseUrl}/session`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        auth: {
          bearer: "SOMETHING_NOT_TOKEN",
        },
      });
      expect(result.statusCode).eql(403);
      expect(result.body.code).to.eql("INVALID_TOKEN");
    });
  });
  describe("DELETE /session", () => {
    let user: User;
    let session: Session;
    before(async () => {
      await clearDb();
      user = new User("user@example.com");
      await user.setPassword("123456");
      await getRepository(User).save(user);
      session = new Session(user);
      await getRepository(Session).save(session);
    });
    after(async () => {
      await clearDb();
    });
    it("200 OK", async () => {
      const result = await request({
        method: "DELETE",
        url: `${baseUrl}/session`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        auth: {
          bearer: session.token,
        },
      });
      expect(result.statusCode).eql(200);
      expect(result.body.token).to.be.a("string");
      {
        const us = result.body.user;
        const uv = user.toView();
        const handleDate = (str: string) => str.substr(0, str.length - 5);
        expect(us.id).to.eql(uv.id);
        expect(us.email).to.eql(uv.email);
        expect(us.permissions).to.eql(uv.permissions);
        expect(handleDate(us.created_at)).to.eql(handleDate(uv.updated_at.toJSON()));
        expect(handleDate(us.updated_at)).to.eql(handleDate(uv.updated_at.toJSON()));
      }
      expect(result.body.permissions).to.eql([]);
      expect(result.body.created_at).to.match(dateRegExp);
      expect(result.body.updated_at).to.match(dateRegExp);
      expect(result.body.expiresAt).to.match(dateRegExp);
      const errResult = await request({
        method: "GET",
        url: `${baseUrl}/session`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        auth: {
          bearer: session.token,
        },
      });
      expect(errResult.statusCode).to.eql(403);
      expect(errResult.body.code).to.eql("EXPIRED_TOKEN");
    });
  });
};
