"use strict";

import { createServer } from "http";
import { getConnection } from "typeorm";
import app from "./app";
import { db_url, port } from "./lib/config";
import initDb from "./lib/db";
import log from "./lib/log";

switch (process.env.NODE_ENV) {
  case "test": {
    log.level = "warn";
    break;
  }
  case "dev":
  case "develop":
  case "development": {
    log.level = "trace";
    break;
  }
  case "prod":
  case "production":
  default: {
    log.level = "info";
    break;
  }
}

export const server = createServer(app.callback());

export const start = async () => {
  await initDb();
  log.info(`database connected to ${db_url}`);
  server.listen(port);
  log.info(`server listening on port ${port}`);
};
export const stop = (signal?: Signals) => {
  log.info(`shutting down server gracefully on ${signal || "demand"}`);
  getConnection().close();
  log.info("database disconnected");
  server.close();
  log.info("server closed");
};

type Signals =
  "SIGABRT" | "SIGALRM" | "SIGBUS" | "SIGCHLD" | "SIGCONT" | "SIGFPE" | "SIGHUP" | "SIGILL" | "SIGINT" | "SIGIO" |
  "SIGIOT" | "SIGKILL" | "SIGPIPE" | "SIGPOLL" | "SIGPROF" | "SIGPWR" | "SIGQUIT" | "SIGSEGV" | "SIGSTKFLT" |
  "SIGSTOP" | "SIGSYS" | "SIGTERM" | "SIGTRAP" | "SIGTSTP" | "SIGTTIN" | "SIGTTOU" | "SIGUNUSED" | "SIGURG" |
  "SIGUSR1" | "SIGUSR2" | "SIGVTALRM" | "SIGWINCH" | "SIGXCPU" | "SIGXFSZ" | "SIGBREAK" | "SIGLOST" | "SIGINFO";
for (const signal of ["SIGABRT", "SIGINT", "SIGTERM"]) {
  process.on(signal as Signals, () => stop(signal as Signals));
}
