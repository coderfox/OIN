import { INestApplication } from "@nestjs/common/interfaces";

import "dotenv/config";
import initDb from "./lib/db";
import { getConnection } from "typeorm";
import { PORT, DB_URL } from "./lib/config";
import log from "./lib/log";

import { buildApplication } from "./app";

let server: INestApplication;
export const start = async () => {
  server = await buildApplication();
  await initDb();
  log.info(`database connected to ${DB_URL}`);
  await server.listenAsync(PORT);
  log.info(`server listening on port ${PORT}`);
};
export const stop = async (signal?: Signals) => {
  log.info(`shutting down server gracefully on ${signal || "demand"}`);
  await getConnection().close();
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
