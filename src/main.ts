import Store from "./store";
import Service from "./service";
import log from "./log";

import RssService from "./services/rss";
import BiliBgm from "./services/bili/bgm";
import BiliUpDynamic from "./services/bili/up_dynamic";
import BiliDynamic from "./services/bili/dynamic";
import PackageService from "./services/package";

const delay = () => new Promise(resolve => setTimeout(resolve, 1000 * 60 * 15));
const loop = async (services: Service[], store: Store) => {
  await Promise.all(
    services.map(service =>
      service.handleChannels()
        .catch(err => log.error("error processing service " + service.client.id, err)),
    ));
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
  await Promise.all(services.map(service => service.initialize()));
  while (true) {
    await loop(services, store);
    await delay();
  }
};

export default main;
