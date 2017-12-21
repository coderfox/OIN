"use strict";

import { createConnection, Connection, ConnectionOptions } from "typeorm";
import { default as conf } from "../lib/config";

export const config: ConnectionOptions = {
  type: "postgres",
  url: conf.get("db_url"),
  entities: [
    "./models/*.js",
  ],
  migrations: [
    "./migrations/*.js",
  ],
  synchronize: process.env.NODE_ENV === "dev",
};
export let connection: Connection;
export default createConnection(config).then((conn) => connection = conn);
