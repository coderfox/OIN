"use strict";

import { ConnectionOptions, createConnection } from "typeorm";
import { db_url } from "../lib/config";

export const config: ConnectionOptions = {
  name: "default",
  type: "postgres",
  url: db_url,
  entities: [
    "./models/*.js",
  ],
  migrations: [
    "./migrations/*.js",
  ],
  synchronize: false,
  migrationsRun: true,
};
export default () => createConnection(config);
