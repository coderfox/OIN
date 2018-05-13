import { Get, Controller, Query, Req, Res, Param, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { SessionAuth } from "../middlewares/authentication";
import { Session, Message } from "../models";
import * as Errors from "../lib/errors";
import getPagination from "../lib/pagination";
import log from "../lib/log";

@Controller("messages")
class MessageController {
  @Get("mine")
  public async get(
    @SessionAuth() session: Session,
    @Req() req: any,
    @Res() res: any,
    @Query("query") query?: string,
  ): Promise<void> {
    const { skip, take } = getPagination(req);
    const where: Partial<Message> = { owner: session.user };
    if (query) {
      const filters = query.split(" ");
      for (const filter of filters) {
        const [type, param] = filter.split(":");
        switch (type) {
          case "readed": {
            where.readed = param === "true";
            break;
          }
          case "subscription": {
            where.subscription = param;
            break;
          }
        }
      }
    } else { where.readed = false; }
    log.debug("where", where, skip, take);
    const [messages, count] = await Message.findAndCount({ where, skip, take });
    log.debug("pagination", skip, take, count, skip + take < count);
    if (count > skip + take) {
      res.set("X-Pagination-More", "true");
    }
    res.send(messages.map(value => value.toViewSimplified()));
  }
  @Get(":id")
  public async getOne(@SessionAuth() session: Session, @Param("id") id: string): Promise<Message> {
    const message = await Message.findOne(id);
    if (!message) {
      throw new Errors.MessageNotExistsError(id);
    }
    if (message.owner.id !== session.user.id) {
      throw new Errors.InsufficientPermissionError(session, "admin");
    }
    return message;
  }
  @HttpCode(HttpStatus.OK)
  @Post(":id")
  public async postOne(
    @SessionAuth() session: Session,
    @Param("id") id: string,
    @Body("readed") readed?: string | boolean,
  ): Promise<{ readed: boolean }> {
    const message = await Message.findOne(id);
    if (!message) {
      throw new Errors.MessageNotExistsError(id);
    }
    if (message.owner.id !== session.user.id) {
      throw new Errors.InsufficientPermissionError(session, "admin");
    }
    message.readed = typeof readed === "string" ? readed === "true" : readed !== undefined ? readed : false;
    await message.save();
    return { readed: message.readed };
  }
}

export default MessageController;
