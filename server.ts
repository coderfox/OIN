"use strict";

import app from "./app";
import { default as initDb, connection as db } from "./lib/db";
import config from "./lib/config";
import log from "./lib/log";
import * as http from "http";

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

export const server = http.createServer(app.callback());
const PORT = config.get("port") || 3000;

export const start = async () => {
  await initDb;
  log.info(`database connected to ${config.get("db_url")}`);
  server.listen(PORT);
  log.info(`server listening on port ${PORT}`);
};
export const stop = (signal?: Signals) => {
  log.info(`shutting down server gracefully on ${signal || "demand"}`);
  db.close();
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
