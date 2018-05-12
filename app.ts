import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import SessionController from "./controllers/session";
import UserController from "./controllers/user";

import { GenericErrorFilter, NotFoundExceptionFilter } from "./middlewares/error";
import { SessionInterceptor } from "./models/session";
import { UserInterceptor } from "./models/user";

@Module({
  imports: [],
  controllers: [
    SessionController,
    UserController,
  ],
  components: [],
})
class ApplicationModule { }

export default ApplicationModule;
export const buildApplication = async () => {
  const app = await NestFactory.create(ApplicationModule);
  app.useGlobalFilters(
    new NotFoundExceptionFilter(),
    new GenericErrorFilter(),
  );
  app.useGlobalInterceptors(
    new SessionInterceptor(),
    new UserInterceptor(),
  );
  return app;
};
