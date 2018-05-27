import { Get, Controller, Req, Res, Param } from "@nestjs/common";
import { Service } from "../models";
import getPagination from "../lib/pagination";
import { classToPlain } from "class-transformer";
import * as Errors from "../lib/errors";

@Controller("services")
class ServiceController {
  @Get()
  public async get_all(
    @Req() req: any,
    @Res() res: any,
  ): Promise<void> {
    const { skip, take } = getPagination(req);
    const [services, count] = await Service.findAndCount({ skip, take });
    if (count > skip + take) {
      res.set("X-Pagination-More", "true");
      res.set("X-Pagination-Total", count);
    }
    res.send(classToPlain(services));
  }
  @Get(":id")
  public async get_one(@Param("id") id: string): Promise<Service> {
    const service = await Service.findOne(id);
    if (!service) {
      throw new Errors.ServiceNotFoundError(id);
    }
    return service;
  }
}

export default ServiceController;
