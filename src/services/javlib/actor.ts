/*
 * Licensed under MIT License
 */
import Service from "../../service";
import ApiClient from "../../client";
import Store from "../../store";
import { SANDRA_CRAWLER_UA } from "../../config";
import Message from "../../message";

import axios from "axios";
import { parseList, parseVideo } from "./parser";

class JavlibGenre extends Service {
  constructor(store: Store) {
    super(new ApiClient(
      "BCF29DF4-5984-4592-93CB-6BC572859635",
      "JavLibrary 演员",
      "配置信息请填写演员代码，如「aejtm」。"), store);
  }
  public initialize = () =>
    this.client.register()
  public mapChannelToMessages = async (actor: string) => {
    const list = await axios({
      method: "GET",
      // tslint:disable-next-line:max-line-length
      url: `http://www.javlibrary.com/ja/vl_star.php?&mode=2&s=${actor}`,
      headers: {
        "User-Agent": SANDRA_CRAWLER_UA,
      },
    });
    const parsedList = parseList(`http://www.javlibrary.com/ja/vl_star.php?&mode=2&s=${actor}`, list.data);
    const messages = await Promise.all(
      parsedList.map(async item => {
        if (!item.link) { throw new Error("invalid result from javlibrary"); }
        const video = await axios(item.link);
        const parsed = parseVideo(item.link, video.data);
        return new Message(
          item.full_title,
          parsed.title,
          `
          <p><img referrerpolicy="no-referrer" src="${parsed.image}"></p>
          <h3><a href="${parsed.link}">${parsed.id}</a>${item.title}</h3>
          <p><b>时长</b> ${parsed.length} 分钟</p>
          <p><b>发布日期</b> ${parsed.release_date.toDateString()}</p>
          <p><b>导演</b> ${parsed.directors.map(v => `<a href="${v.link}">${v.name}</a>`).join("、")}</p>
          <p><b>制片商</b> ${parsed.producers.map(v => `<a href="${v.link}">${v.name}</a>`).join("、")}</p>
          <p><b>发行商</b> ${parsed.publishers.map(v => `<a href="${v.link}">${v.name}</a>`).join("、")}</p>
          <p><b>类型</b> ${parsed.genres.map(v => `<a href="${v.link}">${v.name}</a>`).join("、")}</p>
          <p><b>演员</b> ${parsed.actors.map(v => `<a href="${v.link}">${v.name}</a>`).join("、")}</p>
          `,
          parsed.release_date,
        );
      }));
    return messages;
  }
}

export default JavlibGenre;
