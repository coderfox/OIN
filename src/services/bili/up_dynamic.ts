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

class BiliUpDynamic extends Service {
  constructor(store: Store) {
    super(new ApiClient(
      "265D5310-DC29-4F35-9E07-F6B74F6BEF26",
      "哔哩哔哩 UP 主动态",
      "测试中。配置信息请填写 uid。"), store);
  }
  public initialize = () =>
    this.client.register()
  public mapChannelToMessages = async (uid: string) => {
    const response = await axios({
      method: "get",
      url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${uid}`,
      headers: {
        "User-Agent": SANDRA_CRAWLER_UA,
        "Referer": `https://space.bilibili.com/${uid}/`,
      },
      // tslint:disable-next-line:no-shadowed-variable
      transformResponse: [(data) => data],
    });
    const data: any[] = JSONbig.parse(response.data).data.cards;
    const feed = {
      title: `${data[0].desc.user_profile.info.uname} 的 bilibili 动态 `,
      link: `https://space.bilibili.com/${uid}/#/dynamic`,
      description: `${data[0].desc.user_profile.info.uname} 的 bilibili 动态 `,
      item: data.map((item) => {
        const parsed = JSONbig.parse(item.card);
        // tslint:disable-next-line:no-shadowed-variable
        const data = parsed.item || parsed;

        // img
        let imgHTML = "";
        if (data.pictures) {
          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < data.pictures.length; i++) {
            imgHTML += `<img referrerpolicy="no-referrer"src="${data.pictures[i].img_src}">`;
          }
        }
        if (data.pic) {
          imgHTML += `<img referrerpolicy="no-referrer"src="${data.pic}">`;
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
        } else if (data.sketch.sketch_id) {
          link = `https://t.bilibili.com/${item.desc.dynamic_id}`;
        }

        return {
          title: data.title || data.description || data.content || (data.vest && data.vest.content),
          // tslint:disable-next-line:max-line-length
          description: `${data.desc || data.description || data.content || data.summary || (data.vest && data.vest.content) + (data.sketch && data.sketch.title)}${imgHTML} `,
          pubDate: new Date(item.desc.timestamp * 1000).toUTCString(),
          link,
        };
      }),
    };
    return feed.item
      .map(item => new Message(
        feed.title,
        item.description,
        `${item.description}<p><a href="${item.link}">查看原文</a></p>`,
        new Date(item.pubDate),
      ));
  }
}

export default BiliUpDynamic;
