#!/usr/bin/env node

console.log(`Sandra/backend-api (C) 2017 Sandra Project Team\n
This program comes with ABSOLUTELY NO WARRANTY.
This is free software, and you are welcome to redistribute it
under certain conditions.
For more information, see "${__dirname}/../LICENSE.md".
`);

import { config } from "../lib/db";
import { writeFileSync } from "fs";

writeFileSync(`${__dirname}/../ormconfig.json`, JSON.stringify(config));
