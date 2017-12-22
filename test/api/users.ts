"use strict";
// tslint:disable:no-unused-expression

import { expect } from "chai";
import * as requestO from "request-promise-native";
import { clearDb, expectDateEquals, request } from "../helpers";
import { User, Session, Confirmation, ConfirmationOperations } from "../../models";
import * as uuid from "uuid/v4";
import { getRepository, getManager } from "typeorm";

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
      await user.save();
      session = new Session(user);
      session.permissions.admin = false;
      sessionAdmin = new Session(user);
      sessionAdmin.permissions.admin = true;
      await getRepository(Session).save([session, sessionAdmin]);
    });
    after(clearDb);
    it("200 OK", async () => {
      const result = await requestO({
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
      const result = await requestO({
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
  describe("POST /users", () => {
    afterEach(clearDb);
    it("200 OK", async () => {
      const result = await requestO({
        method: "POST",
        url: `${baseUrl}/users`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        body: {
          email: "user@example.com",
          password: "123456",
        },
      });
      expect(result.statusCode).to.eql(202);
      expect(result.body).to.eql({});
    });
    it("303 DUPLICATED_EMAIL", async () => {
      // prepare a user
      const user = new User("user@example.com");
      await user.setPassword("123456");
      await user.save();
      // start test
      const result = await requestO({
        method: "POST",
        url: `${baseUrl}/users`,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        body: {
          email: "user@example.com",
          password: "123456",
        },
      });
      expect(result.statusCode).to.eql(303);
      expect(result.body.code).to.eql("DUPLICATED_EMAIL");
    });
  });
  describe("PUT /confirmations/:id #confirm_reg", async () => {
    let confirm: Confirmation;
    beforeEach(async () => {
      await clearDb();
      confirm = new Confirmation({
        operation: ConfirmationOperations.Register, data: {
          email: "user@example.com",
          hashedPassword: await User.hashPassword("123456"),
        },
      });
      await confirm.save();
    });
    afterEach(clearDb);
    it("201 Created", async () => {
      const result = await requestO({
        method: "PUT",
        url: `${baseUrl}/confirmations/${confirm.id}`,
        simple: false,
        resolveWithFullResponse: true,
        json: {
          confirmed: true,
        },
      });
      expect(result.statusCode).to.eql(201);
      const user = await User.findOne();
      expect(user).to.be.not.undefined;
      expect(result.body).to.eql((user as User).toView());
    });
    it("404 CONFIRMATION_NOT_FOUND #invalid", async () => {
      const result = await requestO({
        method: "PUT",
        url: `${baseUrl}/confirmations/invalid`,
        simple: false,
        resolveWithFullResponse: true,
        json: {
          confirmed: true,
        },
      });
      expect(result.statusCode).to.eql(404);
      expect(result.body.code).to.eql("CONFIRMATION_NOT_FOUND");
    });
    it("404 CONFIRMATION_NOT_FOUND #expired", async () => {
      confirm.expiresAt = new Date();
      await getManager().save(confirm);
      const result = await requestO({
        method: "PUT",
        url: `${baseUrl}/confirmations/${confirm.id}`,
        simple: false,
        resolveWithFullResponse: true,
        json: {
          confirmed: true,
        },
      });
      expect(result.statusCode).to.eql(404);
      expect(result.body.code).to.eql("CONFIRMATION_NOT_FOUND");
    });
    it("404 CONFIRMATION_NOT_FOUND #used", async () => {
      const result = await requestO({
        method: "PUT",
        url: `${baseUrl}/confirmations/${confirm.id}`,
        simple: false,
        resolveWithFullResponse: true,
        json: {
          confirmed: true,
        },
      });
      expect(result.statusCode).to.eql(201);
      const user = await User.findOne();
      expect(user).to.be.not.undefined;
      expect(result.body).to.eql((user as User).toView());
      const resultB = await requestO({
        method: "PUT",
        url: `${baseUrl}/confirmations/${confirm.id}`,
        simple: false,
        resolveWithFullResponse: true,
        json: {
          confirmed: true,
        },
      });
      expect(resultB.statusCode).to.eql(404);
      expect(resultB.body.code).to.eql("CONFIRMATION_NOT_FOUND");
    });
  });
  describe("GET /user/:id", () => {
    let admin: User;
    let user: User;
    let adminSession: Session;
    let adminSessionWithoutPermission: Session;
    let userSession: Session;
    beforeEach(async () => {
      admin = new User("admin@example.com");
      await admin.setPassword("admin");
      adminSession = new Session(admin);
      adminSession.permissions.admin = true;
      adminSessionWithoutPermission = new Session(admin);
      user = new User("user@example.com");
      await user.setPassword("user");
      userSession = new Session(user);
      await getManager().save([admin, user]);
      await getManager().save([adminSession, adminSessionWithoutPermission, userSession]);
    });
    afterEach(clearDb);
    it("200 OK # normal user", async () => {
      const result = await requestO({
        method: "GET",
        url: `${baseUrl}/users/${user.id}`,
        simple: false,
        resolveWithFullResponse: true,
        json: {
          confirmed: true,
        },
        auth: {
          bearer: userSession.token,
        },
      });
      expect(result.statusCode).to.eql(200);
      expect(result.body).to.eql(user.toView());
    });
    it("200 OK # admin", async () => {
      const result = await requestO({
        method: "GET",
        url: `${baseUrl}/users/${user.id}`,
        simple: false,
        resolveWithFullResponse: true,
        json: {
          confirmed: true,
        },
        auth: {
          bearer: adminSession.token,
        },
      });
      expect(result.statusCode).to.eql(200);
      expect(result.body).to.eql(user.toView());
    });
    it("404 USER_NOT_FOUND", async () => {
      const result = await requestO({
        method: "GET",
        url: `${baseUrl}/users/${uuid()}`,
        simple: false,
        resolveWithFullResponse: true,
        json: {
          confirmed: true,
        },
        auth: {
          bearer: userSession.token,
        },
      });
      expect(result.statusCode).to.eql(404);
      expect(result.body.code).to.eql("USER_NOT_FOUND");
    });
    it("403 INSUFFICIENT_PERMISSION", async () => {
      const result = await requestO({
        method: "GET",
        url: `${baseUrl}/users/${admin.id}`,
        simple: false,
        resolveWithFullResponse: true,
        json: {
          confirmed: true,
        },
        auth: {
          bearer: userSession.token,
        },
      });
      expect(result.statusCode).to.eql(403);
      expect(result.body.code).to.eql("INSUFFICIENT_PERMISSION");
    });
  });
  describe("POST /users/:id", () => {
    let admin: User;
    let user: User;
    let adminSession: Session;
    let adminSessionWithoutPermission: Session;
    let userSession: Session;
    beforeEach(async () => {
      admin = new User("admin@example.com");
      await admin.setPassword("admin");
      adminSession = new Session(admin);
      adminSession.permissions.admin = true;
      adminSessionWithoutPermission = new Session(admin);
      user = new User("user@example.com");
      await user.setPassword("user");
      userSession = new Session(user);
      await getManager().save([admin, user]);
      await getManager().save([adminSession, adminSessionWithoutPermission, userSession]);
    });
    afterEach(clearDb);
    it("202 Accepted # user email", async () => {
      const result = await request(
        `POST /users/${user.id}`,
        "202 Accepted", {
          auth: {
            username: "user@example.com",
            password: "user",
          },
          body: {
            email: "new@example.com",
          },
        });
      expect(result).to.eql(user.toView());
    });
    it("200 OK # user password", () => request(
      `POST /users/${user.id}`,
      "200 OK", {
        auth: { username: "user@example.com", password: "user" },
        body: { password: "usernew" },
      }),
    );
    it("400 NEW_EMAIL_OR_PASSWORD_NOT_SUPPLIED", () => request(
      `POST /users/${user.id}`,
      "400 NEW_EMAIL_OR_PASSWORD_NOT_SUPPLIED", {
        auth: { username: "user@example.com", password: "user" },
      }),
    );
    it("200 OK # admin", () => request(
      `POST /users/${user.id}`,
      "200 OK", {
        auth: { bearer: adminSession.token },
        body: { email: "new", password: "newpass" },
      }));
  });
  describe("PUT /confirmations/:id #confirm_new_email", async () => {
    let confirm: Confirmation;
    beforeEach(async () => {
      await clearDb();
      const user = new User("user@example.com");
      await user.setPassword("pass");
      await user.save();
      confirm = new Confirmation({
        operation: ConfirmationOperations.UpdateEmail, data: {
          uid: user.id,
          newEmail: "new@example.com",
        },
      });
      await confirm.save();
    });
    afterEach(clearDb);
    it("200 OK", async () => {
      const result = await requestO({
        method: "PUT",
        url: `${baseUrl}/confirmations/${confirm.id}`,
        simple: false,
        resolveWithFullResponse: true,
        json: {
          confirmed: true,
        },
      });
      expect(result.statusCode).to.eql(200);
      const user = await User.findOne();
      expect(user).not.to.be.undefined;
      expect((user as User).email).to.eql("new@example.com");
    });
    it("404 CONFIRMATION_NOT_FOUND #used", async () => {
      const result = await requestO({
        method: "PUT",
        url: `${baseUrl}/confirmations/${confirm.id}`,
        simple: false,
        resolveWithFullResponse: true,
        json: {
          confirmed: true,
        },
      });
      expect(result.statusCode).to.eql(200);
      const resultB = await requestO({
        method: "PUT",
        url: `${baseUrl}/confirmations/${confirm.id}`,
        simple: false,
        resolveWithFullResponse: true,
        json: {
          confirmed: true,
        },
      });
      expect(resultB.statusCode).to.eql(404);
      expect(resultB.body.code).to.eql("CONFIRMATION_NOT_FOUND");
    });
  });
};
