import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import Raven from "raven";
import * as path from "path";

import { NestLogger } from "./lib/log";

import { GenericErrorFilter } from "./middlewares/error";
import SerializeInterceptor from "./middlewares/serialize.interceptor";

import SessionController from "./controllers/session";
import UserController from "./controllers/user";
import MessageController from "./controllers/message";
import ServiceController from "./controllers/service";
import SubscriptionController from "./controllers/subscription";
import RpcController from "./controllers/rpc";
import { SENTRY_DSN } from "./lib/config";

@Module({
  imports: [],
  controllers: [
    SessionController,
    UserController,
    MessageController,
    ServiceController,
    SubscriptionController,
    RpcController,
  ],
  components: [],
})
class ApplicationModule { }

export default ApplicationModule;
const root = __dirname || process.cwd();
export const buildApplication = async () => {
  Raven.config(SENTRY_DSN, {
    // tslint:disable-next-line:naming-convention
    dataCallback(data) {
      const stacktrace = data.exception && data.exception[0].stacktrace;

      if (stacktrace && stacktrace.frames) {
        stacktrace.frames.forEach((frame: any) => {
          if (frame.filename.startsWith("/")) {
            frame.filename = "app:///" + path.relative(root, frame.filename);
          }
        });
      }

      return data;
    },
  }).install();
  const app = await NestFactory.create(ApplicationModule, {
    logger: new NestLogger(),
  });
  app.useGlobalFilters(
    new GenericErrorFilter(),
  );
  app.useGlobalInterceptors(
    new SerializeInterceptor(),
  );
  app.use(((_: any, res: any, next: any) => {
    res.set("Server", "sandra.server.api.rest/0.2.0 (REST/0.4)");
    next();
  }));
  app.enableCors({
    origin: true,
    credentials: true,
  });
  return app;
};
