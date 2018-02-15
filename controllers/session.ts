import { Get, Controller } from "@nestjs/common";

@Controller("session")
class SessionController {
  @Get()
  public root(): string {
    return "Hello World!";
  }
  @Get("500")
  public error() {
    throw new Error();
  }
}

export default SessionController;
