import RssHubService from "./base";
import Store from "../../store";

// tslint:disable:max-classes-per-file
// tslint:disable:max-line-length

export class Pixiv1Service extends RssHubService {
  constructor(store: Store) {
    super(
      "0b5f8d85-c4dd-4eac-9a54-21aeeab00584",
      "Pixiv | 用户收藏",
      "/pixiv/user/bookmarks/",
      "['用户 id, 可在用户主页 URL 中找到']",
      store,
    );
  }
}
export class Pixiv2Service extends RssHubService {
  constructor(store: Store) {
    super(
      "d2d63c92-a45d-4007-a90e-9aafdf01cbc1",
      "Pixiv | 用户动态",
      "/pixiv/user/",
      "['用户 id, 可在用户主页 URL 中找到']",
      store,
    );
  }
}
export class Pixiv3Service extends RssHubService {
  constructor(store: Store) {
    super(
      "ec0739d7-ae24-4f33-b496-d9cc2aa9dbea",
      "Pixiv | 排行榜",
      "/pixiv/ranking/",
      `['排行榜类型']
| pixiv 日排行 | pixiv 周排行 | pixiv 月排行 | pixiv 受男性欢迎排行 | pixiv 受女性欢迎排行 | pixiv 原创作品排行 | pixiv 新人排行 |
| ------------ | ------------ | ------------ | -------------------- | -------------------- | ------------------ | -------------- |
| day          | week         | month        | day_male             | day_female           | week_original      | week_rookie    |
`,
      store,
    );
  }
}
