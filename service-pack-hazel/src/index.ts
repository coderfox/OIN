import main from "./main";
import log from "./log";

main()
  .then(() => process.exit(0))
  .catch(err => {
    log.error(err);
    process.exit(1);
  });
