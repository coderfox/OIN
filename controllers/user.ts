import { Get, Controller, Post, Body, HttpCode } from "@nestjs/common";
import { SessionAuth } from "../middlewares/authentication";
import { User, Session } from "../models";
import * as Errors from "../lib/errors";
import { isEmail } from "validator";

@Controller("users")
class UserController {
  @HttpCode(201)
  @Post()
  public async post(@Body("email") email: string, @Body("password") password: string): Promise<User> {
    if (await User.findOne({ email })) {
      throw new Errors.DuplicateEmailError(email);
    }
    if (!isEmail(email)) {
      throw new Errors.BadRequestError("body:email");
    }
    const user = new User(email);
    await user.setPassword(password);
    await user.save();
    return user;
  }
  @Get("me")
  public getMe(@SessionAuth() session: Session): User {
    return session.user;
  }
}

export default UserController;
