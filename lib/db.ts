"use strict";

import { createConnection, Connection, ConnectionOptions } from "typeorm";
import { db_url } from "../lib/config";

export const config: ConnectionOptions = {
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
export let connection: Connection;
export default createConnection(config).then((conn) => connection = conn);
