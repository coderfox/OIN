import RssHubService from "./base";
import Store from "../../store";

// tslint:disable:max-classes-per-file

export class Zhihu1Service extends RssHubService {
  constructor(store: Store) {
    super(
      "9c2b09f0-0c3d-44a1-93ec-40d45d9661d4",
      "知乎 | 收藏夹",
      "/zhihu/collection/",
      "['收藏夹 id, 可在收藏夹页面 URL 中找到']",
      store,
    );
  }
}
export class Zhihu2Service extends RssHubService {
  constructor(store: Store) {
    super(
      "4501de25-9d5e-465a-931e-da567f69a934",
      "知乎 | 用户动态",
      "/zhihu/people/activities/",
      "['作者 id, 可在用户主页 URL 中找到']",
      store,
    );
  }
}
export class Zhihu3Service extends RssHubService {
  constructor(store: Store) {
    super(
      "4d0e1c31-81d6-4e26-9609-cdeea672e1a6",
      "知乎 | 用户回答",
      "/zhihu/people/answers/",
      "['作者 id, 可在用户主页 URL 中找到']",
      store,
    );
  }
}
export class Zhihu4Service extends RssHubService {
  constructor(store: Store) {
    super(
      "e34d5154-28a5-408b-a35e-7e6c311e92fe",
      "知乎 | 专栏",
      "/zhihu/zhuanlan/",
      "['专栏 id, 可在专栏主页 URL 中找到']",
      store,
    );
  }
}
export class Zhihu5Service extends RssHubService {
  constructor(store: Store) {
    super(
      "d1eba8bb-e926-4c57-9744-0b7604f3fb79",
      "知乎 | 知乎日报",
      "/zhihu/daily",
      "留空",
      store,
    );
  }
}
export class Zhihu6Service extends RssHubService {
  constructor(store: Store) {
    super(
      "06ad3a5d-0ab8-4a8c-b2a5-654deaac45a0",
      "知乎 | 知乎热榜",
      "/zhihu/hotlist",
      "留空",
      store,
    );
  }
}
export class Zhihu7Service extends RssHubService {
  constructor(store: Store) {
    super(
      "9c1b4aac-eb18-4d1f-a60c-0b1e2f6165c7",
      "知乎 | 知乎想法热榜",
      "/zhihu/pin/hotlist",
      "留空",
      store,
    );
  }
}
export class Zhihu8Service extends RssHubService {
  constructor(store: Store) {
    super(
      "3ba62067-1bec-47fa-abba-6f9af61a2c0e",
      "知乎 | 问题",
      "/zhihu/question/",
      "['问题 id']",
      store,
    );
  }
}
export class Zhihu9Service extends RssHubService {
  constructor(store: Store) {
    super(
      "177c7176-8dc7-4474-8e28-f28f3d693d35",
      "知乎 | 话题",
      "/zhihu/topic/",
      "['话题 id']",
      store,
    );
  }
}
export class Zhihu10Service extends RssHubService {
  constructor(store: Store) {
    super(
      "5f021817-cbe4-4b76-81e6-eeedea176d26",
      "知乎 | 用户想法",
      "/zhihu/people/pins/",
      "['作者 id, 可在用户主页 URL 中找到']",
      store,
    );
  }
}
export class Zhihu11Service extends RssHubService {
  constructor(store: Store) {
    super(
      "15a93ba5-21e9-494c-9e69-510040f43da3",
      "知乎 | 知乎书店-新书",
      "/zhihu/bookstore/newest",
      "留空",
      store,
    );
  }
}
export class Zhihu12Service extends RssHubService {
  constructor(store: Store) {
    super(
      "8de0eba4-278d-42b6-b3af-70955af6ed4d",
      "知乎 | 知乎想法-24小时新闻汇总",
      "/zhihu/pin/daily",
      "留空",
      store,
    );
  }
}
export class Zhihu13Service extends RssHubService {
  constructor(store: Store) {
    super(
      "dfca2e18-25df-4657-ba14-32207d46e354",
      "知乎 | 知乎书店-知乎周刊",
      "/zhihu/weekly",
      "留空",
      store,
    );
  }
}
