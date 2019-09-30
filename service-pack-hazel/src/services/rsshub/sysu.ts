import RssHubService from "./base";
import Store from "../../store";

// tslint:disable:max-classes-per-file

// https://rsshub.app/sysu/sdcs

export class SysuService extends RssHubService {
  constructor(store: Store) {
    super(
      "22dad1e9-c4cd-43fd-a24b-e81eff8a8084",
      "中山大学 | 数据科学与计算机学院动态",
      "/sysu/sdcs",
      "留空",
      store,
    );
  }
}
