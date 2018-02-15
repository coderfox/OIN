import { Get, Controller, Put, Delete } from "@nestjs/common";
import { SessionAuth, BasicAuth } from "../middlewares/authentication";
import { User, Session } from "../models";

@Controller("session")
class SessionController {
  @Get()
  public get( @SessionAuth() session: Session): Session {
    return session;
  }
  @Put()
  public async create( @BasicAuth() user: User): Promise<Session> {
    const session = new Session(user);
    await session.save();
    return session;
  }
  @Delete()
  public async delete( @SessionAuth() session: Session) {
    session.expiresAt = new Date();
    await session.save();
    return session;
  }
}

export default SessionController;
