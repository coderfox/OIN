"use strict";

import * as logger from "pino";
import { log_level } from "./config";

export default logger({ level: log_level });
