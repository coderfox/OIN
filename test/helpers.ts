"use strict";

import { expect } from "chai";
import { User, Session, Confirmation } from "../models";
import { getRepository } from "typeorm";

export const clearDb = async () => {
  for (const schema of [Session, User, Confirmation]) {
    const repo = getRepository(schema);
    await repo.remove(await repo.find());
  }
};
export const expectDateEquals = (a: Date, b: Date) =>
  expect(Math.round(new Date(a).getTime() / 10000))
    .to.eql(Math.round(new Date(b).getTime() / 10000));
