import { start } from "./server";
import initDb from "./lib/db";
import { writeFile } from "fs";
import { promisify } from "util";

const main = async () => {
  const [, , command] = process.argv;
  switch (command) {
    case "db:migrate": {
      const db = await initDb();
      await db.runMigrations();
      await db.close();
      break;
    }
    case "db:revert": {
      const db = await initDb();
      await db.undoLastMigration();
      await db.close();
      break;
    }
    case "db:generate-config": {
      const db = await initDb();
      await promisify(writeFile)("ormconfig.json", JSON.stringify(db.options));
      await db.close();
      break;
    }
    default:
      await start();
  }
};

main().catch((err: any) => {
  console.error(err);
  process.exit(1);
});
