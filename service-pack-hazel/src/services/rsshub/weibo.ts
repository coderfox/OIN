import RssHubService from "./base";
import Store from "../../store";

// tslint:disable:max-classes-per-file

// <Route name="(.*)" author=".*" example=".*" path="(.*):\w+" :paramsDesc="(.*)"/>
// <Route name="(.*)" author=".*" example=".*" path="(.*):\w+"/>

// tslint:disable-next-line:max-line-length
// export class WeiboService extends RssHubService {constructor(store: Store) {super("UUID","微博 | $1","$2","$3",store,);}}
// tslint:disable-next-line:max-line-length
// export class WeiboService extends RssHubService {constructor(store: Store) {super("UUID","微博 | $1","$2","留空",store,);}}

export class Weibo1Service extends RssHubService {
  constructor(store: Store) {
    super(
      "d72bf65d-0413-46f4-912b-186ae15aa7b4",
      "微博 | 博主（方案1）",
      "/weibo/user/",
      "['用户 id, 博主主页打开控制台执行 `$CONFIG.oid` 获取']",
      store,
    );
  }
}
export class Weibo2Service extends RssHubService {
  constructor(store: Store) {
    super(
      "40b119ff-3c0d-4259-903d-a84b08a9b78f",
      "微博 | 博主（方案2）",
      "/weibo/user2/",
      "['用户 id, 博主主页打开控制台执行 `$CONFIG.oid` 获取']",
      store,
    );
  }
}
export class Weibo3Service extends RssHubService {
  constructor(store: Store) {
    super(
      "7e61182d-b9f8-4854-a0fd-1db6356e5399",
      "微博 | 关键词",
      "/weibo/keyword/",
      "['你想订阅的微博关键词']",
      store,
    );
  }
}
export class Weibo4Service extends RssHubService {
  constructor(store: Store) {
    super(
      "4ab409c5-b51c-4793-bdd1-f2b50c426ff8",
      "微博 | 热搜榜",
      "/weibo/search/hot",
      "留空",
      store,
    );
  }
}
