import { createConnection, ConnectionOptions } from "typeorm";
import { db_url } from "../lib/config";

export const config: ConnectionOptions = {
  name: "default",
  type: "postgres",
  url: db_url,
  entities: [
    `${__dirname}/../models/*.js`,
  ],
  migrations: [
    `${__dirname}/../migrations/*.js`,
  ],
  synchronize: false,
};
export default () => createConnection(config);
