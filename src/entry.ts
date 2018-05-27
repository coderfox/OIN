import { start } from "./server";
import initDb from "./lib/db";

const main = async () => {
  const [, , command] = process.argv;
  switch (command) {
    case "db:migrate": {
      const db = await initDb();
      await db.runMigrations();
      break;
    }
    case "db:revert": {
      const db = await initDb();
      await db.undoLastMigration();
      break;
    }
    default:
      await start();
  }
};

main()
  .catch((err: any) => {
    console.error(err);
    process.exit(1);
  });
