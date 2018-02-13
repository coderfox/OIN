#!/usr/bin/env node

import { writeFileSync } from "fs";
import { config } from "../lib/db";

writeFileSync(`${__dirname}/../ormconfig.json`, JSON.stringify(config));
