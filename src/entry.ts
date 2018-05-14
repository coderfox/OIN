import { start } from "./server";

start()
  .catch((err: any) => {
    console.error(err);
    process.exit(1);
  });
