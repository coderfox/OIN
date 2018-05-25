/*
 * Thanks to https://github.com/DIYgod/RSSHub/blob/master/routes/bilibili/dynamic.js
 * Licensed under MIT License
 */
import Service from "../../service";
import ApiClient from "../../client";
import Store from "../../store";
import axios from "axios";
import { SANDRA_CRAWLER_UA } from "../../config";
import Message from "../../message";
// tslint:disable-next-line:no-var-requires
const JSONbig = require("json-bigint");
import { parse as parseCookie } from "cookie";

class BiliDynamicFollow extends Service {
  constructor(store: Store) {
    super(new ApiClient(
      "47BF7A7F-78DC-4B07-850F-9969080A0C19",
      "哔哩哔哩关注动态",
      "测试中。配置信息请填写 cookies。"), store);
  }
  public initialize = () =>
    this.client.register()
  public mapChannelToMessages = async (config: string) => {
    const cookie = parseCookie(config);
    const uid = cookie.DedeUserID;
    const response = await axios({
      method: "get",
      url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${uid}&type=268435455`,
      headers: {
        "User-Agent": SANDRA_CRAWLER_UA,
        "Referer": "https://t.bilibili.com",
        "Origin": "https://t.bilibili.com",
        // tslint:disable-next-line:max-line-length
        "Cookie": `DedeUserID=${cookie.DedeUserID}; DedeUserID__ckMd5=${cookie.DedeUserID__ckMd5}; SESSDATA=${cookie.SESSDATA}`,
      },
      // tslint:disable-next-line:no-shadowed-variable
      transformResponse: [(data) => data],
    });
    const data: any[] = JSONbig.parse(response.data).data.cards;

    const feed = data.map((item) => {
      const parsed = JSONbig.parse(item.card);
      // tslint:disable-next-line:no-shadowed-variable
      const data = parsed.item || parsed;

      // img
      const imgHTML = "";
      if (data.pictures) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < data.pictures.length; i++) {
          imgHTML.concat(`<img referrerpolicy="no-referrer"src="${data.pictures[i].img_src}">`);
        }
      }
      if (data.pic) {
        imgHTML.concat(`<img referrerpolicy="no-referrer"src="${data.pic}">`);
      }
      if (data.cover) {
        imgHTML.concat(`<img referrerpolicy="no-referrer"src="${data.cover}">`);
      }

      // link
      let link = "";
      if (data.dynamic_id) {
        link = `https://t.bilibili.com/${data.dynamic_id}`;
      } else if (data.aid) {
        link = `https://www.bilibili.com/video/av${data.aid}`;
      } else if (data.video_playurl) {
        link = `https://vc.bilibili.com/video/${data.id}`;
      } else if (data.id) {
        link = `https://h.bilibili.com/${data.id}`;
      } else if (data.sketch && data.sketch.sketch_id) {
        link = `https://t.bilibili.com/${item.desc.dynamic_id}`;
      } else if (data.new_ep && data.new_ep.url) {
        link = data.new_ep.url;
      }

      return {
        title: data.title || data.description || data.content || (data.vest && data.vest.content) || data.index_title,
        // tslint:disable-next-line:max-line-length
        description: `${data.desc || data.description || data.content || data.summary || (data.vest && data.vest.content) + (data.sketch && data.sketch.title)}${imgHTML} `,
        pubDate: new Date(item.desc.timestamp * 1000).toUTCString(),
        link,
      };
    });
    return feed
      .map(item => new Message(
        item.title,
        item.description,
        `${item.description}<p><a href="${item.link}">查看原文</a></p>`,
        new Date(item.pubDate),
      ));
  }
}

export default BiliDynamicFollow;
