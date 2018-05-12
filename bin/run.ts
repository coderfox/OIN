#!/usr/bin/env node

console.log(`Sandra/backend-api (C) 2017 Sandra Project Team\n
This program comes with ABSOLUTELY NO WARRANTY.
This is free software, and you are welcome to redistribute it
under certain conditions.
For more information, see "${__dirname}/../LICENSE.md".
`);

import { start } from "../server";

start()
  .catch((err: any) => {
    console.error(err);
    process.exit(1);
  });
