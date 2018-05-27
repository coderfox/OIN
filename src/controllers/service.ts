import { Get, Controller, Req, Res } from "@nestjs/common";
import { Service } from "../models";
import getPagination from "../lib/pagination";
import { classToPlain } from "class-transformer";

@Controller("services")
class ServiceController {
  @Get()
  public async getAll(
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
}

export default ServiceController;
