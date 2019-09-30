import { createConnection, ConnectionOptions } from "typeorm";
import { DB_URL } from "../lib/config";

const config: ConnectionOptions = {
  name: "default",
  type: "postgres",
  url: DB_URL,
  entities: [`${__dirname}/../models/*.js`],
  migrations: [`${__dirname}/../migrations/*.js`],
  synchronize: false,
  cli: {
    migrationsDir: `${__dirname}/../migrations/`,
  },
};
export default () => createConnection(config);
