import log from "./log";
import { SANDRA_HAZEL_STORE } from "./config";
import { readFile, writeFile } from "fs";
import { promisify } from "util";

class Store {
  constructor(private data: { [key: string]: Date | undefined }) { }
  public static load = async () => {
    log.info("loading storage from ", SANDRA_HAZEL_STORE);
    try {
      const fileContent = await promisify(readFile)(SANDRA_HAZEL_STORE);
      const data: { [key: string]: string | Date } = JSON.parse(fileContent.toString());
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          data[key] = new Date(data[key]);
        }
      }
      return new Store(data as any);
    } catch {
      return new Store({});
    }
  }
  private static normalizeKey = (service: string, channel: string) =>
    `${service}#${channel}`.toLowerCase()
  public set = (service: string, channel: string, value: Date) => {
    if (this.get(service, channel) > value) {
      log.debug("set storage skipped", { service, channel, value });
    } else {
      log.debug("set storage", { service, channel, value });
      this.data[Store.normalizeKey(service, channel)] = value;
    }
  }
  public get = (service: string, channel: string) =>
    this.data[Store.normalizeKey(service, channel)] || new Date(0)
  public save = async () => {
    log.info("writing storage to ", SANDRA_HAZEL_STORE);
    log.debug("data = ", this.data);
    await promisify(writeFile)(SANDRA_HAZEL_STORE, JSON.stringify(this.data));
  }
}

export default Store;
