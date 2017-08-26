"use strict";

import { expect } from "chai";
import { connection as db } from "../lib/db";
import { User, Session } from "../models";

export const clearDb = async () => {
  for (const schema of [Session, User]) {
    db.getRepository(schema).remove(await db.getRepository(schema).find());
  }
};
export const expectDateEquals = (a: Date, b: Date) =>
  expect(Math.round(new Date(a).getTime() / 1000))
    .to.eql(Math.round(new Date(b).getTime() / 1000));
