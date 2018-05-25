import Store from "./store";
import BiliBgm from "./services/bili/bgm";
import BiliDynamic from "./services/bili/dynamic";
import Service from "./service";
import RssService from "./services/rss";

const delay = () => new Promise(resolve => setTimeout(resolve, 1000 * 60 * 15));
const loop = async (services: Service[], store: Store) => {
  await Promise.all(services.map(service => service.handleChannels()));
  await store.save();
};
const main = async () => {
  const store = await Store.load();
  const services: Service[] = [];
  services.push(new BiliBgm(store));
  services.push(new BiliDynamic(store));
  services.push(new RssService(store));
  await Promise.all(services.map(service => service.initialize()));
  while (true) {
    await loop(services, store);
    await delay();
  }
};

export default main;
