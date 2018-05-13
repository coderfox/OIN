import { Get, Controller, Req, Res } from "@nestjs/common";
import { Service } from "../models";
import getPagination from "../lib/pagination";

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
    }
    res.send(services.map(value => value.toView()));
  }
}

export default ServiceController;
