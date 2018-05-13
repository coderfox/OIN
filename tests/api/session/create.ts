import test from "ava";
import { requestAssert, init, dateRegExp } from "../../helpers";
import { User } from "../../../models";

const user = new User("user@example.com");
init(test);
test.before.serial(async () => {
  await user.setPassword("password");
  await user.save();
});

const api = "PUT /session";

test("200 OK", async (t) => {
  const result = await requestAssert(t, api, "200 OK", {
    username: "user@example.com",
    password: "password",
  });
  t.is(typeof result.token, "string");
  t.is(typeof result.user.id, "string");
  t.is(result.user.email, "user@example.com");
  t.regex(result.user.created_at, dateRegExp);
  t.regex(result.user.updated_at, dateRegExp);
  t.regex(result.created_at, dateRegExp);
  t.regex(result.updated_at, dateRegExp);
  t.regex(result.expires_at, dateRegExp);
  const shouldExpireDate = new Date(result.created_at);
  shouldExpireDate.setDate(new Date().getDate() + 7);
  t.true(new Date(result.expires_at) > shouldExpireDate);
});
test("403 USER_NOT_FOUND", async t => requestAssert(t, api, "403 USER_NOT_FOUND", {
  username: "invalid@example.com",
  password: "password",
}));
test("403 PASSWORD_MISMATCH", async t => requestAssert(t, api, "403 PASSWORD_MISMATCH", {
  username: "user@example.com",
  password: "invalid",
}));
test("401 INVALID_AUTHENTICATION_TYPE", async t => requestAssert(t, api, "401 INVALID_AUTHENTICATION_TYPE", "token"));
test.todo("403 INSUFFICIENT_PERMISSION");
