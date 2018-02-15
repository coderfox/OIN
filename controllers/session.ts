import { Get, Controller, Put, Delete, Body } from "@nestjs/common";
import { SessionAuth, BasicAuth } from "../middlewares/authentication";
import { User, Session } from "../models";
import { Roles, Role, Permission } from "../lib/permission";
import * as Errors from "../lib/errors";

@Controller("session")
class SessionController {
  @Get()
  public get( @SessionAuth() session: Session): Session {
    return session;
  }
  @Put()
  public async create( @BasicAuth() user: User, @Body("permission") permissions?: Roles): Promise<Session> {
    const session = new Session(user);
    for (const permission in permissions || []) {
      if (!user.permission.check(permission as Role)) {
        throw new Errors.InsufficientPermissionError(session, permission);
      }
    }
    session.permission = new Permission(permissions);
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
