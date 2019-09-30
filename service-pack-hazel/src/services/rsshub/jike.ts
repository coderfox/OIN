import RssHubService from "./base";
import Store from "../../store";

// tslint:disable:max-classes-per-file

export class Jike1Service extends RssHubService {
  constructor(store: Store) {
    super(
      "acc6b08b-49a0-432e-94f2-241fbe5e0a9d",
      "即刻 | 圈子-精选",
      "/jike/topic/",
      "['圈子 id, 可在即刻 web 端圈子页或 APP 分享出来的圈子页 URL 中找到']",
      store,
    );
  }
}
export class Jike2Service extends RssHubService {
  constructor(store: Store) {
    super(
      "1e0ef9ea-3404-4659-8fb3-c9aed3cd2b37",
      "即刻 | 圈子-广场",
      "/jike/topic/square/",
      "['圈子 id, 可在即刻 web 端圈子页或 APP 分享出来的圈子页 URL 中找到']",
      store,
    );
  }
}
export class Jike3Service extends RssHubService {
  constructor(store: Store) {
    super(
      "7b438df6-1eb4-40dd-bf7f-7a37941f721e",
      "即刻 | 圈子-纯文字",
      "/jike/topic/text/",
      "['圈子 id, 可在即刻 web 端圈子页或 APP 分享出来的圈子页 URL 中找到']",
      store,
    );
  }
}
export class Jike4Service extends RssHubService {
  constructor(store: Store) {
    super(
      "12280cff-281e-4df2-9588-b237c8694ee2",
      "即刻 | 用户动态",
      "/jike/user/",
      "['用户 id, 可在即刻 web 端用户页 URL 中找到']",
      store,
    );
  }
}
export class Jike5Service extends RssHubService {
  constructor(store: Store) {
    super(
      "79e90676-5a83-48f4-9325-786f83cf5030",
      "即刻 | 即刻小报",
      "/jike/daily",
      "留空",
      store,
    );
  }
}
