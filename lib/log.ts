"use strict";

import * as logger from "pino";
import { log_level } from "./config";

export default logger({ level: process.env.NODE_ENV === "test" ? "warn" : log_level });
