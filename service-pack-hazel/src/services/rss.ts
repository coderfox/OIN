/*
 * Thanks to https://github.com/DIYgod/RSSHub/blob/master/routes/bilibili/dynamic.js
 * Licensed under MIT License
 */
import Service from "../service";
import ApiClient from "../client";
import Store from "../store";
import axios from "axios";
import { SANDRA_CRAWLER_UA } from "../config";
import Message from "../message";
import FeedMe from "feedme";
import { Stream } from "stream";

const parse = (data: Stream) =>
  new Promise<FeedMe.Document>((resolve, reject) => {
    const parser = new FeedMe(true);
    data.pipe(parser);
    parser.on("end", () => {
      resolve(parser.done());
    });
    parser.on("error", err => reject(err));
  });

class RssService extends Service {
  constructor(store: Store) {
    super(
      new ApiClient(
        "8573810F-6559-4CD1-8C0B-7A1E6D6F37FC",
        "RSS / Atom / JSON Feed",
        "测试中。配置信息请填写 Feed 地址。",
      ),
      store,
    );
  }
  public initialize = () => this.client.register();
  public mapChannelToMessages = async (url: string) => {
    const response = await axios({
      url,
      headers: {
        "User-Agent": SANDRA_CRAWLER_UA,
      },
      responseType: "stream",
    });
    const feed = await parse(response.data);
    return feed.items.map(
      item =>
        new Message(
          `[${feed.title}]${item.title}`,
          item.description,
          item.description,
          new Date(item.pubdate),
          item.link,
        ),
    );
  }
}

export default RssService;
