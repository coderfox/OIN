import { Get, Controller, Query } from "@nestjs/common";

@Controller()
class SessionController {
  @Get()
  public root( @Query("sample") sample: string): string {
    return "Hello World!" + sample;
  }
}

export default SessionController;
