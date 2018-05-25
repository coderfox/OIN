import Store from "./store";
import BiliBgm from "./services/bili/bgm";
import BiliDynamic from "./services/bili/dynamic";
import Service from "./service";

const main = async () => {
  const store = await Store.load();
  const services: Service[] = [];
  services.push(new BiliBgm(store));
  services.push(new BiliDynamic(store));
  await Promise.all(services.map(service => service.initialize()));
  await Promise.all(services.map(service => service.handleChannels()));
  await store.save();
};

export default main;
