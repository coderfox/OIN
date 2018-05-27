import { Controller, Post, Body, UseInterceptors, HttpCode, HttpStatus } from "@nestjs/common";
import { Subscription, Service, Message } from "../models";
import * as Errors from "../lib/errors";
import RpcInterceptor, { RpcErrorInterceptor } from "../middlewares/rpc";
import { DEPLOY_TOKEN } from "../lib/config";

@UseInterceptors(RpcInterceptor, RpcErrorInterceptor)
@Controller("rpc")
class RpcController {
  @HttpCode(HttpStatus.OK)
  @Post("register_service")
  public async register_service(
    @Body("metadata") metadata?: {
      id?: string,
      name?: string,
      description?: string,
    },
    @Body("deploy_token") deploy_token?: string,
  ): Promise<string> {
    if (!metadata || !metadata.id || !metadata.name || !metadata.description || !deploy_token) {
      throw new Errors.RpcInvalidParametersError("body:param");
    }
    if (deploy_token !== DEPLOY_TOKEN) {
      throw new Errors.RpcInsufficientPermissionError();
    }
    const existing_service = await Service.findOne(metadata.id);
    if (existing_service) {
      existing_service.name = metadata.name;
      existing_service.description = metadata.description;
      await existing_service.save();
      return existing_service.token;
    } else {
      const service = new Service(metadata.id, metadata.name, metadata.description);
      await service.save();
      return service.token;
    }
  }
  @HttpCode(HttpStatus.OK)
  @Post("get_channels")
  public async get_channels(
    @Body("token") token?: string,
  ): Promise<Array<{ id: string, config: string }>> {
    if (!token) {
      throw new Errors.RpcInvalidParametersError("body:param:token");
    }
    const service = await Service.findOne({ token });
    if (!service) {
      throw new Errors.RpcInvalidTokenError(token);
    }
    return (await service.subscriptions)
      .filter(s => s.deleted === false)
      .map(s => ({
        id: s.id,
        config: s.config,
      }));
  }
  @HttpCode(HttpStatus.OK)
  @Post("create_message")
  public async create_message(
    @Body("token") token?: string,
    @Body("channel_id") channel?: string,
    @Body("message") msg?: {
      title?: string,
      summary?: string,
      content?: string,
    },
  ): Promise<true> {
    if (!token || !channel || !msg || !msg.title || !msg.content) {
      throw new Errors.RpcInvalidParametersError("body:param");
    }
    const service = await Service.findOne({ token });
    if (!service) {
      throw new Errors.RpcInvalidTokenError(token);
    }
    const subscription = await Subscription.findOne(channel);
    if (!subscription) {
      throw new Errors.RpcChannelNotFoundError(channel);
    }
    const message = new Message(
      subscription.owner,
      subscription,
      msg.title,
      msg.summary || msg.content,
      msg.content);
    await message.save();
    return true;
  }
}

export default RpcController;
