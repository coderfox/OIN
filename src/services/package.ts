/*
 * Thanks to https://github.com/DIYgod/RSSHub/blob/master/routes/express/express.js
 * Thanks to https://github.com/coderfox/Kuaidi100API
 * Licensed under MIT License
 */
import Service from "../service";
import ApiClient from "../client";
import Store from "../store";
import axios from "axios";
import { SANDRA_CRAWLER_UA } from "../config";
import Message from "../message";

class PackageService extends Service {
  constructor(store: Store) {
    super(new ApiClient(
      "29911A4B-B722-47EA-9AB8-BC15E363C39E",
      "快递",
      "快递信息追踪，接口由 kuaidi100.com 提供。配置信息请填写用「|」分隔的快递公司名称和快递单号，例如：「yunda|1600887249033」。"), store);
  }
  public initialize = () =>
    this.client.register()
  public mapChannelToMessages = async (config: string) => {
    const [company, packageId] = config.split("|");

    const response = await axios({
      method: "get",
      url: `https://www.kuaidi100.com/query?type=${company}&postid=${packageId}`,
      headers: {
        "User-Agent": SANDRA_CRAWLER_UA,
        "Referer": "https://www.kuaidi100.com",
      },
    });

    const data: any[] = response.data.data;

    const state = {
      title: ` 快递 ${company}-${packageId}`,
      link: "https://www.kuaidi100.com",
      description: ` 快递 ${company}-${packageId}`,
      item: data.map((item) => ({
        title: item.context,
        description: item.context,
        pubDate: new Date(item.time || item.ftime),
        link: item.context,
      })),
    };

    return state.item.map(item => new Message(
      state.title.concat(" 有新动态"),
      item.description,
      item.description,
      item.pubDate));
  }
}

export default PackageService;
