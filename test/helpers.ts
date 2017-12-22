"use strict";

import { expect } from "chai";
import { User, Session, Confirmation } from "../models";
import { getRepository } from "typeorm";
import * as requestO from "request-promise-native";

export const clearDb = async () => {
  for (const schema of [Session, User, Confirmation]) {
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
  if (status >= 200 && status < 300) {
    expect(result.statusCode).eql(status);
  } else {
    expect({
      status: result.statusCode,
      code: result.body.code,
    }).to.eql({
      status,
      code,
    });
  }
  return result.body;
};
