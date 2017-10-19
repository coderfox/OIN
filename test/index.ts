"use strict";

process.env.NODE_ENV = "test";
import run from "../bin/run";
import models from "./models";
import api from "./api";
import lib from "./lib";
import log from "../lib/log";

before(async () => {
  try {
    await run;
  } catch (err) {
    log.warn("cannot initialize server, using existing server instead, tests may fail");
  }
});
describe("lib", lib);
describe("models", models);
describe("api", api);
