import { INestApplication } from "@nestjs/common/interfaces";

import "dotenv/config";
import initDb from "./lib/db";
import { getConnection } from "typeorm";
import { port, db_url, debug } from "./lib/config";
import log from "./lib/log";

import { buildApplication } from "./app";
import User from "./models/user";
import Session from "./models/session";

let server: INestApplication;
export const start = async () => {
  server = await buildApplication();
  await initDb();
  log.info(`database connected to ${db_url}`);
  await server.listenAsync(port);
  log.info(`server listening on port ${port}`);
  if (debug) {
    try {
      log.info("filling sample data for debug usage");
      const admin = new User("admin@example.com");
      admin.permission.grant("admin");
      await admin.setPassword("admin");
      await admin.save();
      const user = new User("user@example.com");
      await user.setPassword("user");
      await user.save();
      const adminSession = new Session(admin);
      adminSession.permission.grant("admin");
      const adminSessionWithoutPermission = new Session(admin);
      const userSession = new Session(user);
      await adminSession.save();
      await userSession.save();
      await adminSessionWithoutPermission.save();
    } catch (err) {
      log.error("cannot fill sample data for debug", err);
    }
  }
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
