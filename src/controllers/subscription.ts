import { Get, Controller, Req, Res, Param, Post, Body, HttpCode, HttpStatus, Delete } from "@nestjs/common";
import { SessionAuth } from "../middlewares/authentication";
import { Session, Subscription, Service } from "../models";
import * as Errors from "../lib/errors";
import getPagination from "../lib/pagination";
import { classToPlain } from "class-transformer";

@Controller("subscriptions")
class SubscriptionController {
  @Get("mine")
  public async get(
    @SessionAuth() session: Session,
    @Req() req: any,
    @Res() res: any,
  ): Promise<void> {
    const { skip, take } = getPagination(req);
    const where: Partial<Subscription> = { owner: session.user };
    const [subscriptions, count] = await Subscription.findAndCount({ where, skip, take });
    if (count > skip + take) {
      res.set("X-Pagination-More", "true");
      res.set("X-Pagination-Total", count);
    }
    // TODO: improve performance
    await Promise.all(subscriptions.map(s => s.fetch_last_event()));
    res.send(classToPlain(subscriptions));
  }
  @Post()
  public async post_all(
    @SessionAuth() session: Session,
    @Body("service") service_id?: string,
    @Body("config") config?: string,
    @Body("name") name?: string,
  ): Promise<Subscription> {
    if (!service_id) {
      throw new Errors.BadRequestError("body:service");
    }
    const service = await Service.findOne(service_id);
    if (!service) {
      throw new Errors.ServiceNotExistsError(service_id);
    }
    const subscription = new Subscription(session.user, service, config, name);
    await subscription.save();
    return subscription;
  }
  @HttpCode(HttpStatus.PARTIAL_CONTENT)
  @Post(":id")
  public async post_one(
    @SessionAuth() session: Session,
    @Param("id") id: string,
    @Body("config") config?: string,
    @Body("name") name?: string,
  ): Promise<{ config?: string, name?: string }> {
    const subscription = await Subscription.findOne(id);
    if (!subscription) {
      throw new Errors.SubscriptionNotExistsError(id);
    }
    if (subscription.owner.id !== session.user.id) {
      throw new Errors.InsufficientPermissionError(session, "admin");
    }
    if (config !== undefined) {
      subscription.config = config;
    }
    if (name !== undefined) {
      subscription.name = name;
    }
    await Promise.all([subscription.save(), subscription.fetch_last_event()]);
    return subscription;
  }
  @Delete(":id")
  public async delete_one(
    @SessionAuth() session: Session,
    @Param("id") id: string,
  ): Promise<Subscription> {
    const subscription = await Subscription.findOne(id);
    if (!subscription) {
      throw new Errors.SubscriptionNotExistsError(id);
    }
    if (subscription.owner.id !== session.user.id) {
      throw new Errors.InsufficientPermissionError(session, "admin");
    }
    subscription.deleted = true;
    await Promise.all([subscription.save(), subscription.fetch_last_event()]);
    return subscription;
  }
  @Get(":id")
  public async get_one(@SessionAuth() session: Session, @Param("id") id: string): Promise<Subscription> {
    const subscription = await Subscription.findOne(id);
    if (!subscription) {
      throw new Errors.MessageNotExistsError(id);
    }
    if (subscription.owner.id !== session.user.id) {
      throw new Errors.InsufficientPermissionError(session, "admin");
    }
    await subscription.fetch_last_event();
    return subscription;
  }
}

export default SubscriptionController;
