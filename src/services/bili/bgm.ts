import Service from "../../service";
import ApiClient from "../../client";
import Store from "../../store";
import axios from "axios";
import { SANDRA_CRAWLER_UA } from "../../config";
import Message from "../../message";

class BiliBgm extends Service {
  constructor(store: Store) {
    super(new ApiClient(
      "a6e8e177-eb8c-45da-b0fa-a0e8d2ba32ea",
      "哔哩哔哩番剧",
      "测试中。配置信息请填写番剧 id。"), store);
  }
  public initialize = () =>
    this.client.register()
  public mapChannelToMessages = async (seasonid: string) => {
    const response = await axios({
      method: "GET",
      // tslint:disable-next-line:max-line-length
      url: `https://bangumi.bilibili.com/jsonp/seasoninfo/${seasonid}.ver?callback=seasonListCallback&jsonp=jsonp&_=${+new Date()}`,
      headers: {
        "User-Agent": SANDRA_CRAWLER_UA,
        "Referer": `https://bangumi.bilibili.com/anime/${seasonid}/`,
      },
    });
    const data = JSON.parse(response.data.match(/^seasonListCallback\((.*)\);$/)[1]).result || {};
    return (data.episodes as any[])
      .map((item: any) => new Message(
        `${data.title} 第 ${item.index} 话 ${item.index_title}`,
        `更新时间：${item.update_time}`,
        // tslint:disable-next-line:max-line-length
        `<p>更新时间：${item.update_time}</p><p><a href="${item.webplay_url}"><img referrerpolicy="no-referrer"src="${item.cover}"></a></p>`,
        new Date(item.update_time),
      ));
  }
}

export default BiliBgm;
