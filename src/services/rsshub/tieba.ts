import RssHubService from "./base";
import Store from "../../store";

// tslint:disable:max-classes-per-file

export class Tieba1Service extends RssHubService {
  constructor(store: Store) {
    super(
      "d26aa7f5-7257-4060-87a9-f441d7245873",
      "贴吧 | 帖子列表",
      "/tieba/forum/",
      "['吧名']",
      store,
    );
  }
}
export class Tieba2Service extends RssHubService {
  constructor(store: Store) {
    super(
      "66928e79-cc37-4873-9e69-b96edf34acb4",
      "贴吧 | 精品帖子",
      "/tieba/forum/good/",
      "['吧名']",
      store,
    );
  }
}
export class Tieba3Service extends RssHubService {
  constructor(store: Store) {
    super(
      "c70bc828-bc11-4fbc-9cb1-42399f586968",
      "贴吧 | 帖子动态",
      "/tieba/post/",
      "['帖子 ID']",
      store,
    );
  }
}
export class Tieba4Service extends RssHubService {
  constructor(store: Store) {
    super(
      "1ec002a1-6a2b-4c1d-bef2-1a8aa167fc1f",
      "贴吧 | 楼主动态",
      "/tieba/post/lz/",
      "['帖子 ID']",
      store,
    );
  }
}
