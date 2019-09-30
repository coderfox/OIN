import Store from "./store";
import Service from "./service";
import log from "./log";

import RssService from "./services/rss";
import BiliBgm from "./services/bili/bgm";
import BiliUpDynamic from "./services/bili/up_dynamic";
import BiliDynamic from "./services/bili/dynamic";
import PackageService from "./services/package";
import JavlibGenre from "./services/javlib/genre";
import JavlibActor from "./services/javlib/actor";
import WeiboUser from "./services/weibo/user";
import {
  Bili10Service,
  Bili1Service,
  Bili2Service,
  Bili3Service,
  Bili4Service,
  Bili5Service,
  Bili6Service,
  Bili7Service,
  Bili8Service,
  Bili9Service,
  Bili11Service,
  Bili12Service,
  Bili13Service,
  Bili14Service,
  Bili15Service,
  Bili16Service,
  Bili17Service,
  Bili18Service,
  Bili19Service,
  Bili20Service,
  Bili21Service,
  Bili22Service,
} from "./services/rsshub/bili";
import {
  Weibo1Service,
  Weibo2Service,
  Weibo3Service,
  Weibo4Service,
} from "./services/rsshub/weibo";
import {
  Tieba1Service,
  Tieba2Service,
  Tieba3Service,
  Tieba4Service,
} from "./services/rsshub/tieba";
import {
  Jike1Service,
  Jike2Service,
  Jike3Service,
  Jike4Service,
  Jike5Service,
} from "./services/rsshub/jike";
import {
  Zhihu1Service,
  Zhihu2Service,
  Zhihu3Service,
  Zhihu4Service,
  Zhihu5Service,
  Zhihu6Service,
  Zhihu7Service,
  Zhihu8Service,
  Zhihu9Service,
  Zhihu10Service,
  Zhihu11Service,
  Zhihu12Service,
  Zhihu13Service,
} from "./services/rsshub/zhihu";
import {
  Pixiv1Service,
  Pixiv2Service,
  Pixiv3Service,
} from "./services/rsshub/pixiv";
import { Ig1Service, Twitter1Service } from "./services/rsshub/instagram";
// import { SANDRA_CRAWLER_INTERVAL } from "./config";

const delay = () => new Promise(resolve => setTimeout(resolve, 1000 * 60 * 2));
const loop = async (services: Service[], store: Store) => {
  await Promise.all(
    services.map(service =>
      service
        .handleChannels()
        .catch(err =>
          log.error("error processing service " + service.client.id, err),
        ),
    ),
  );
  await store.save();
};
const main = async () => {
  const store = await Store.load();
  const services: Service[] = [];
  services.push(new BiliBgm(store));
  services.push(new BiliUpDynamic(store));
  services.push(new RssService(store));
  services.push(new BiliDynamic(store));
  services.push(new PackageService(store));
  services.push(new JavlibGenre(store));
  services.push(new JavlibActor(store));
  services.push(new WeiboUser(store));
  // RSSHub
  services.push(new Bili1Service(store));
  services.push(new Bili2Service(store));
  services.push(new Bili3Service(store));
  services.push(new Bili4Service(store));
  services.push(new Bili5Service(store));
  services.push(new Bili6Service(store));
  services.push(new Bili7Service(store));
  services.push(new Bili8Service(store));
  services.push(new Bili9Service(store));
  services.push(new Bili10Service(store));
  services.push(new Bili11Service(store));
  services.push(new Bili12Service(store));
  services.push(new Bili13Service(store));
  services.push(new Bili14Service(store));
  services.push(new Bili15Service(store));
  services.push(new Bili16Service(store));
  services.push(new Bili17Service(store));
  services.push(new Bili18Service(store));
  services.push(new Bili19Service(store));
  services.push(new Bili20Service(store));
  services.push(new Bili21Service(store));
  services.push(new Bili22Service(store));
  services.push(new Weibo1Service(store));
  services.push(new Weibo2Service(store));
  services.push(new Weibo3Service(store));
  services.push(new Weibo4Service(store));
  services.push(new Tieba1Service(store));
  services.push(new Tieba2Service(store));
  services.push(new Tieba3Service(store));
  services.push(new Tieba4Service(store));
  services.push(new Jike1Service(store));
  services.push(new Jike2Service(store));
  services.push(new Jike3Service(store));
  services.push(new Jike4Service(store));
  services.push(new Jike5Service(store));
  services.push(new Zhihu1Service(store));
  services.push(new Zhihu2Service(store));
  services.push(new Zhihu3Service(store));
  services.push(new Zhihu4Service(store));
  services.push(new Zhihu5Service(store));
  services.push(new Zhihu6Service(store));
  services.push(new Zhihu7Service(store));
  services.push(new Zhihu8Service(store));
  services.push(new Zhihu9Service(store));
  services.push(new Zhihu10Service(store));
  services.push(new Zhihu11Service(store));
  services.push(new Zhihu12Service(store));
  services.push(new Zhihu13Service(store));
  services.push(new Pixiv1Service(store));
  services.push(new Pixiv2Service(store));
  services.push(new Pixiv3Service(store));
  services.push(new Ig1Service(store));
  services.push(new Twitter1Service(store));
  await Promise.all(services.map(service => service.initialize()));
  while (true) {
    await loop(services, store);
    await delay();
  }
};

export default main;
