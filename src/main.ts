import ApiClient from "./client";
import { SANDRA_BACKEND_URL, SANDRA_CRAWLER_UA } from "./config";
import log from "./log";
import axios from "axios";

const main = async () => {
  console.log(SANDRA_BACKEND_URL);
  const service = new ApiClient(
    "a6e8e177-eb8c-45da-b0fa-a0e8d2ba32ea",
    "哔哩哔哩番剧",
    "测试中。配置信息请填写番剧 id。");
  log.info("registered service with token", await service.register());
  const channels = await service.getChannels();
  for (const channel of channels) {
    log.info("parsing channel", channel);
    // with credits to <https://github.com/DIYgod/RSSHub/blob/master/routes/bilibili/bangumi.js>
    const seasonid = channel.config;
    log.debug("season=", seasonid);
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
    if (data && data.episodes) {
      for (const item of data.episodes) {
        log.debug("found item", item);
        await service.createMessage(
          channel.id,
          `${data.title} 第 ${item.index} 话 ${item.index_title}`,
          ` 更新时间：${item.update_time}`,
          // tslint:disable-next-line:max-line-length
          ` 更新时间：${item.update_time}<a href="${item.webplay_url}"><img referrerpolicy="no-referrer"src="${item.cover}"></a>`,
        );
      }
    }
  }
};

export default main;
