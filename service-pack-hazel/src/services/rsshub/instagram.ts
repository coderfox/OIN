// https://rsshub.app/instagram/user/diygod

import RssHubService from "./base";
import Store from "../../store";

// tslint:disable:max-classes-per-file

export class Ig1Service extends RssHubService {
  constructor(store: Store) {
    super(
      "5513043e-37ee-46cd-9e9a-a93cfff7fadb",
      "Instagram | 用户",
      "/instagram/user/",
      "用户 id",
      store,
    );
  }
}

export class Twitter1Service extends RssHubService {
  constructor(store: Store) {
    super(
      "efa80df4-a90e-46b9-a264-c818a31e635e",
      "Twitter | 用户",
      "/twitter/user/",
      "用户 twitter 名",
      store,
    );
  }
}

export class Solidot1Service extends RssHubService {
  constructor(store: Store) {
    super(
      "f67432a9-8ce4-4550-9050-94111470676c",
      "Solidot",
      "/solidot/",
      "留空",
      store,
    );
  }
}
