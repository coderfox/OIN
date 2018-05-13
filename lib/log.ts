"use strict";

import * as logger from "pino";
import { log_level } from "./config";
import { LoggerService } from "@nestjs/common";

const log = logger({ level: process.env.NODE_ENV === "test" ? "warn" : log_level });
export default log;

export class NestLogger implements LoggerService {
  public log(message: string) {
    log.info(message);
  }
  public error(message: string, trace: string) {
    log.error(message, trace);
  }
  public warn(message: string) {
    log.warn(message);
  }
}
