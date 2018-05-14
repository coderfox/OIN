import { createConnection, ConnectionOptions } from "typeorm";
import { db_url } from "../lib/config";

export const config: ConnectionOptions = {
  name: "default",
  type: "postgres",
  url: db_url,
  entities: [
    "./dist/models/*.js",
  ],
  migrations: [
    "./dist/migrations/*.js",
  ],
  synchronize: false,
};
export default () => createConnection(config);
