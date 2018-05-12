import { Get, Controller } from "@nestjs/common";
import { SessionAuth } from "../middlewares/authentication";
import { User, Session } from "../models";
import * as Errors from "../lib/errors";

@Controller("users")
class UserController {
  @Get()
  public async getAll( @SessionAuth() session: Session) {
    if (!session.permission.check("admin")) {
      throw new Errors.InsufficientPermissionError(session, "admin");
    }
    return await User.find();
  }
}

export default UserController;
