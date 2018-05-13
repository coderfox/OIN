import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { NestLogger } from "./lib/log";

import SessionController from "./controllers/session";
import UserController from "./controllers/user";
import MessageController from "./controllers/message";

import { GenericErrorFilter, NotFoundExceptionFilter } from "./middlewares/error";
import { MessageInterceptor } from "./models/message";
import { SessionInterceptor } from "./models/session";
import { UserInterceptor } from "./models/user";

@Module({
  imports: [],
  controllers: [
    SessionController,
    UserController,
    MessageController,
  ],
  components: [],
})
class ApplicationModule { }

export default ApplicationModule;
export const buildApplication = async () => {
  const app = await NestFactory.create(ApplicationModule, {
    logger: new NestLogger(),
  });
  app.useGlobalFilters(
    new NotFoundExceptionFilter(),
    new GenericErrorFilter(),
  );
  app.useGlobalInterceptors(
    new SessionInterceptor(),
    new UserInterceptor(),
    new MessageInterceptor(),
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
