import { Module } from "@nestjs/common";

import SessionController from "../controllers/session";

@Module({
  imports: [],
  controllers: [SessionController],
  components: [],
})
class ApplicationModule { }

export default ApplicationModule;
