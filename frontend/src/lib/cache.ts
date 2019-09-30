import forage from 'localforage';
import * as I from './api_interfaces';

export const CACHE_NS = {
  PREFIX: 'cache_',
  MESSAGE: 'message',
  SUBSCRITPION: 'subscription',
  SERVICE: 'service',
  REQUEST: 'request',
};

const message = forage.createInstance({
  name: CACHE_NS.PREFIX + CACHE_NS.MESSAGE,
  storeName: 'kv',
});
const subscription = forage.createInstance({
  name: CACHE_NS.PREFIX + CACHE_NS.SUBSCRITPION,
  storeName: 'kv',
});
const service = forage.createInstance({
  name: CACHE_NS.PREFIX + CACHE_NS.SERVICE,
  storeName: 'kv',
});

interface Stored<T> {
  value: T;
  expires: number;
}

const rm = async (ns: LocalForage, id: string) =>
  ns.removeItem(id);
const get = async <T>(ns: LocalForage, id: string): Promise<T | null> => {
  const stored: Stored<T> = await ns.getItem<Stored<T>>(id);
  if (!stored) {
    return null;
  } else if (stored.expires <= Date.now()) {
    rm(ns, id);
    return null;
  } else {
    return stored.value;
  }
};
const set = async <T>(ns: LocalForage, id: string, value: T, expireInMin = 30) =>
  ns.setItem(id, { value, expires: Date.now() + 1000 * 60 * expireInMin } as Stored<T>);
const clear = (ns: LocalForage) => ns.clear();

export const getMessage = async (id: string): Promise<I.Message | null> =>
  get<I.Message>(message, id);
export const setMessage = async (value: I.Message) =>
  set(message, value.id, value);
export const rmMessage = async (id: string) =>
  rm(message, id);
export const clearMessage = async () => clear(message);

export const getSubscription = async (id: string): Promise<I.Subscription | null> =>
  get<I.Subscription>(subscription, id);
export const setSubscription = async (value: I.Subscription) =>
  set(subscription, value.id, value);
export const rmSubscription = async (id: string) =>
  rm(subscription, id);
export const clearSubscription = async () => clear(subscription);

export const getService = async (id: string): Promise<I.Service | null> =>
  get<I.Service>(service, id);
export const setService = async (value: I.Service) =>
  set(service, value.id, value);
export const rmService = async (id: string) =>
  rm(service, id);
export const clearService = async () => clear(service);
