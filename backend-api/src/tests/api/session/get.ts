import test from "ava";
import { requestAssert, init, DATE_REGEXP } from "../../helpers";
import { User, Session } from "../../../models";
import uuid from "uuid/v4";

const user = new User("user@example.com");
const session = new Session(user);
init(test);
test.before.serial(async () => {
  await user.set_password("password");
  await user.save();
  await session.save();
});

const api = "GET /session";

test("200 OK", async t => {
  const result = await requestAssert(t, api, "200 OK", session.token);
  t.is(typeof result.token, "string");
  t.is(typeof result.user.id, "string");
  t.is(result.user.email, "user@example.com");
  t.regex(result.user.created_at, DATE_REGEXP);
  t.regex(result.user.updated_at, DATE_REGEXP);
  t.regex(result.created_at, DATE_REGEXP);
  t.regex(result.updated_at, DATE_REGEXP);
  t.regex(result.expires_at, DATE_REGEXP);
  const should_expires_at = new Date(result.created_at);
  should_expires_at.setDate(new Date().getDate() + 7);
  t.true(new Date(result.expires_at) > should_expires_at);
});
test("403 INVALID_TOKEN", async t =>
  requestAssert(t, api, "403 INVALID_TOKEN", uuid()));
test("403 INVALID_AUTHENTICATION_TYPE", async t =>
  requestAssert(t, api, "403 INVALID_AUTHENTICATION_TYPE", {
    username: "user@example.com",
    password: "invalid",
  }));
