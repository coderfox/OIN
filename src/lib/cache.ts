import store from 'store';

import * as Interfaces from './api_interfaces';
export const CACHE_NS = {
  PREFIX: 'CACHE',
  MESSAGE: 'MESSAGE',
  SUBSCRITPION: 'CHANNEL',
  SERVICE: 'SERVICE',
  REQUEST: 'REQUEST',
};

const cache = store.namespace(CACHE_NS.PREFIX);
const message = cache.namespace(CACHE_NS.MESSAGE);
const subscription = cache.namespace(CACHE_NS.SUBSCRITPION);
const service = cache.namespace(CACHE_NS.SERVICE);

interface Stored<T> {
  value: T;
  expires: number;
}

const rm = (ns: StoreJsAPI, id: string) =>
  ns.remove(id);
const get = <T>(ns: StoreJsAPI, id: string): T | null => {
  const stored: Stored<T> = ns.get(id);
  if (!stored) {
    return null;
  } else if (stored.expires <= Date.now()) {
    rm(ns, id);
    return null;
  } else {
    return stored.value;
  }
};
const set = <T>(ns: StoreJsAPI, id: string, value: T, expireInMin = 30) =>
  ns.set(id, { value, expires: Date.now() + 1000 * 60 * expireInMin } as Stored<T>);
const clear = (ns: StoreJsAPI) => ns.clearAll();

export const getMessage = (id: string): Interfaces.Message | null =>
  get(message, id);
export const setMessage = (value: Interfaces.Message) =>
  set(message, value.id, value);
export const rmMessage = (id: string) =>
  rm(message, id);
export const clearMessage = () => clear(message);

export const getSubscription = (id: string): Interfaces.Subscription | null =>
  get(subscription, id);
export const setSubscription = (value: Interfaces.Subscription) =>
  set(subscription, value.id, value);
export const rmSubscription = (id: string) =>
  rm(subscription, id);
export const clearSubscription = () => clear(subscription);

export const getService = (id: string): Interfaces.Service | null =>
  get(service, id);
export const setService = (value: Interfaces.Service) =>
  set(service, value.id, value);
export const rmService = (id: string) =>
  rm(service, id);
export const clearService = () => clear(service);
