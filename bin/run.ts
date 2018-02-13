#!/usr/bin/env node

import { start } from "../server";

start()
  .catch((err: any) => {
    // tslint:disable-next-line:no-console
    console.error(err);
    process.exit(1);
  });
