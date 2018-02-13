"use strict";

import { expect, assert } from "chai";
import { Message, User, Session, Confirmation } from "../models";
import { getRepository } from "typeorm";
import * as requestO from "request-promise-native";

export const clearDb = async () => {
  for (const schema of [Message, Session, User, Confirmation]) {
    const repo = getRepository(schema);
    await repo.remove(await repo.find());
  }
};
export const expectDateEquals = (a: Date, b: Date) =>
  expect(Math.round(new Date(a).getTime() / 10000))
    .to.eql(Math.round(new Date(b).getTime() / 10000));
const baseUrl = "http://127.0.0.1:3000";
export const request = async (dest: string, validate: string, op?: {
  auth?: any,
  body?: any,
}) => {
  const indexOfSpaceInDest = dest.indexOf(" ");
  const method = dest.substr(0, indexOfSpaceInDest);
  const url = dest.substr(indexOfSpaceInDest + 1);
  const result = await requestO({
    method,
    url: `${baseUrl}${url}`,
    simple: false,
    resolveWithFullResponse: true,
    json: true,
    body: op ? op.body : undefined,
    auth: op ? op.auth : undefined,
  });
  const indexOfSpaceInValidate = validate.indexOf(" ");
  const status = +validate.substr(0, indexOfSpaceInValidate);
  const code = validate.substr(indexOfSpaceInValidate + 1);
  assert.equal(result.statusCode, status, "HTTP status code");
  if (!(status >= 200 && status < 300)) {
    assert.equal(result.body.code, code, "error code");
  }
  return result.body;
};
export const UuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
