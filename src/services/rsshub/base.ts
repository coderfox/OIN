import Service from "../../service";
import ApiClient from "../../client";
import Store from "../../store";
import axios from "axios";
import { SANDRA_CRAWLER_UA } from "../../config";
import Message from "../../message";
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

abstract class RssHubService extends Service {
  constructor(
    uuid: string,
    title: string,
    private url: string,
    desc: string,
    store: Store,
  ) {
    super(new ApiClient(uuid, title, desc), store);
  }
  public initialize = () => this.client.register();
  public mapChannelToMessages = async (config: string) => {
    const response = await axios({
      url: "https://rsshub.app" + this.url + config,
      headers: {
        "User-Agent": SANDRA_CRAWLER_UA,
      },
      responseType: "stream",
    });
    const feed = await parse(response.data);
    return feed.items.map(
      item =>
        new Message(
          `${item.title}`,
          item.description,
          item.description,
          new Date(item.pubdate),
          item.link,
        ),
    );
  }
}

export default RssHubService;
