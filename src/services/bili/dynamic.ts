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
// import log from "../../log";

const CARD_TYPES = {
  ALL: 268435455,
  REPOST: 1, // done
  PIC: 2, // done
  WORD: 4, // done
  VIDEO: 8, // done
  CLIP: 16, // done
  DRAMA: 32, // done
  ARTICLE: 64, // done
  LIVE: 128,
  MUSIC: 256,
  BANGUMI: 512, // done
  NONE: 1024,
  H5_SHARE: 2048,
  HOT: 1e3,
};

const mapCardToContent = (type: number, card: any) => {
  // tslint:disable:max-line-length
  switch (type) {
    case CARD_TYPES.VIDEO:
      return `
        <p>
          <a href="https://space.bilibili.com/${card.owner.mid}/#/dynamic">${card.owner.name}</a>
          ${card.title}
        </p>
        <p><a href="https://www.bilibili.com/video/av${card.aid}"><img referrerpolicy="no-referrer" src="${card.pic}"></a></p>
        <p>${card.desc.split("\n").join("<br>")}</p>
      `;
    case CARD_TYPES.CLIP:
      return `
        <p>
          <a href="https://space.bilibili.com/${card.user.uid}/#/dynamic">${card.user.name}</a>
          ${card.item.description}
        </p>
        <p><a href="https://vc.bilibili.com/video/${card.item.id}"><img referrerpolicy="no-referrer" src="${card.item.cover.default}"></a></p>
      `;
    case CARD_TYPES.DRAMA:
      return `
        <p>${card.title} 第 ${card.new_ep.index} 集 - ${card.new_ep.index_title}</p>
        <p><a href="${card.new_ep.url}"><img referrerpolicy="no-referrer" src="${card.new_ep.cover}"></a></p>
      `;
    case CARD_TYPES.BANGUMI:
      return `
        <p>${card.apiSeasonInfo.title} 第 ${card.index} 集 - ${card.index_title}</p>
        <p><a href="${card.url}"><img referrerpolicy="no-referrer" src="${card.cover}"></a></p>
      `;
    case CARD_TYPES.ARTICLE:
      return `
        <p><a href="https://www.bilibili.com/read/cv${card.id}"><b>${card.title}</b></a></p>
        <p><a href="https://space.bilibili.com/${card.author.mid}/#/article">${card.author.name}</a></p>
        ${card.banner_url ?
          `<p><img referrerpolicy="no-referrer" src="${card.banner_url}"></p>
          <p>${card.summary}</p>` :
          `<p>${card.summary}</p>
          <p>
          ${(card.image_urls as string[]).map(image => `<img referrerpolicy="no-referrer" src="${image}">`).join("<br>")}
          </p>`
        }
      `;
    case CARD_TYPES.PIC:
      return `
        <p>
          <a href="https://space.bilibili.com/${card.user.uid}/#/dynamic">${card.user.name}</a>：
          ${card.item.description}
        </p>
        <p>
        ${card.item.pictures.map((pic: any) => `<img referrerpolicy="no-referrer" src="${pic.img_src}">`).join("<br>")}
        </p>
        <p><a href="https://h.bilibili.com/${card.item.id}">阅读原文</a></p>
      `;
    case CARD_TYPES.WORD:
      return `
        <p><a href="https://space.bilibili.com/${card.user.uid}/#/dynamic">${card.user.uname}</a>：${card.item.content}</p>
        <p><a href="https://t.bilibili.com/${card.item.dynamic_id}">阅读原文</a></p>
      `;
    case CARD_TYPES.REPOST:
      return `
        <p><a href="https://space.bilibili.com/${card.user.uid}/#/dynamic">${card.user.uname}</a>：${card.item.content}</p>
      `;
    default:
      return "<p>不支持的动态内容</p>";
  }
  // tslint:enable:max-line-length
};

class BiliDynamic extends Service {
  constructor(store: Store) {
    super(new ApiClient(
      "47BF7A7F-78DC-4B07-850F-9969080A0C19",
      "哔哩哔哩关注动态",
      "测试中。配置信息请填写 cookies。支持的动态类型：图片、文字、投稿、小视频、番剧、文章。"), store);
  }
  public initialize = () =>
    this.client.register()
  public mapChannelToMessages = async (config: string) => {
    const cookie = parseCookie(config);
    const uid = cookie.DedeUserID;
    const response = await axios({
      method: "get",
      url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${uid}&type=${CARD_TYPES.ALL}`,
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

    return data
      .map(item => {
        // tslint:disable:max-line-length
        const card = JSONbig.parse(item.card);
        switch (item.desc.type) {
          case CARD_TYPES.VIDEO:
            return new Message(
              `@${item.desc.user_profile.info.uname} 有新投稿视频`,
              card.dynamic,
              mapCardToContent(item.desc.type, card),
              new Date(item.desc.timestamp * 1000),
            );
          case CARD_TYPES.CLIP:
            return new Message(
              `@${item.desc.user_profile.info.uname} 有新的小视频`,
              card.item.description,
              mapCardToContent(item.desc.type, card),
              new Date(item.desc.timestamp * 1000),
            );
          case CARD_TYPES.DRAMA:
            return new Message(
              `${card.title} 更新了第 ${card.new_ep.index} 集`,
              `${card.new_ep.index_title}`,
              mapCardToContent(item.desc.type, card),
              new Date(item.desc.timestamp * 1000),
            );
          case CARD_TYPES.BANGUMI:
            return new Message(
              `${card.apiSeasonInfo.title} 更新了第 ${card.index} 集`,
              `${card.index_title}`,
              mapCardToContent(item.desc.type, card),
              new Date(item.desc.timestamp * 1000),
            );
          case CARD_TYPES.ARTICLE:
            return new Message(
              `@${item.desc.user_profile.info.uname} 有新专栏文章`,
              `${card.title} ${card.summary}`,
              mapCardToContent(item.desc.type, card),
              new Date(item.desc.timestamp * 1000),
            );
          case CARD_TYPES.PIC:
            return new Message(
              `@${item.desc.user_profile.info.uname} 有新动态`,
              `${card.item.description}`,
              mapCardToContent(item.desc.type, card),
              new Date(item.desc.timestamp * 1000),
            );
          case CARD_TYPES.WORD:
            return new Message(
              `@${item.desc.user_profile.info.uname} 有新动态`,
              `${card.item.content}`,
              mapCardToContent(item.desc.type, card),
              new Date(item.desc.timestamp * 1000),
            );
          case CARD_TYPES.REPOST:
            return new Message(
              `@${item.desc.user_profile.info.uname} 有新动态`,
              `${card.item.content}`,
              mapCardToContent(item.desc.type, card) + mapCardToContent(item.desc.orig_type, JSONbig.parse(card.origin)),
              new Date(item.desc.timestamp * 1000),
            );
          default:
            return null;
        }
        // tslint:enable:max-line-length
      })
      .filter(item => item !== null) as Message[];
  }
}

export default BiliDynamic;
