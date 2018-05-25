import Store from "./store";
import BiliBgm from "./services/bili/bgm";

const main = async () => {
  const store = await Store.load();
  const biliBgm = new BiliBgm(store);
  await biliBgm.initialize();
  await biliBgm.handleChannels();
  await store.save();
};

export default main;
