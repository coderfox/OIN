import { observable, action, computed } from 'mobx';
import * as Interfaces from './api_interfaces';
import ApiClient from './client';

const store = require('store');

export const TOKEN_KEY = 'token';
export const CACHE_KEY = {
  PREFIX: 'CACHE_',
  MESSAGE: 'M_',
  SUBSCRITPION: 'C_',
  SERVICE: 'S_',
  REQUEST: 'REQ_',
};

export class Cache {
  static get = <T>(type: string, key: string): T | null => {
    const result: { value: T, expires: number } = store.get([CACHE_KEY.PREFIX, type, key].join(''));
    if (!result || result.expires <= Date.now()) {
      return null;
    } else {
      return result.value;
    }
  }
  static set = <T>(type: string, key: string, value: T, expireInMin = 60): void => {
    const result = {
      value,
      expires: Date.now() + 1000 * 60 * expireInMin,
    };
    store.set([CACHE_KEY.PREFIX, type, key].join(''), result);
  }
  static rm = (type: string, key: string): void => {
    store.remove([CACHE_KEY.PREFIX, type, key].join(''));
  }
  static getMessage = (id: string): Interfaces.Message | null =>
    Cache.get(CACHE_KEY.MESSAGE, id)
  static setMessage = (id: string, value: Interfaces.Message) =>
    Cache.set(CACHE_KEY.MESSAGE, id, value)
  static rmMessage = (id: string) =>
    Cache.rm(CACHE_KEY.MESSAGE, id)
  static getSubscription = (id: string): Interfaces.Subscription | null =>
    Cache.get(CACHE_KEY.SUBSCRITPION, id)
  static setSubscription = (id: string, value: Interfaces.Subscription) =>
    Cache.set(CACHE_KEY.SUBSCRITPION, id, value)
  static rmSubscription = (id: string) =>
    Cache.rm(CACHE_KEY.SUBSCRITPION, id)
  static getService = (id: string): Interfaces.Service | null =>
    Cache.get(CACHE_KEY.SERVICE, id)
  static setService = (id: string, value: Interfaces.Service) =>
    Cache.set(CACHE_KEY.SERVICE, id, value)
  static rmService = (id: string) =>
    Cache.rm(CACHE_KEY.SERVICE, id)
  static getRequest = <T>(id: string): T | null =>
    Cache.get(CACHE_KEY.REQUEST, id)
  static setRequest = <T>(id: string, value: T) =>
    Cache.set(CACHE_KEY.REQUEST, id, value)
  static rmRequest = (id: string) =>
    Cache.rm(CACHE_KEY.REQUEST, id)
}

export default class SessionState {
  @observable public session?: Interfaces.Session;
  @computed public get authenticated() {
    if (!this.session) { return false; }
    if (Date.parse(this.session.expires_at) < Date.now()) { return false; }
    return true;
  }

  public client?: ApiClient;

  constructor() {
    const savedToken = store.get(TOKEN_KEY);
    if (savedToken) { this.setToken(savedToken); }
  }

  @action setToken(session: Interfaces.Session) {
    this.client = new ApiClient(session.token);
    store.set(TOKEN_KEY, session);
    this.session = session;
  }
  @action removeToken() {
    store.remove(TOKEN_KEY);
    this.session = undefined;
  }
  @action login = async (email: string, password: string) => {
    const session = await ApiClient.login(email, password);
    this.setToken(session);
    return session.token;
  }

  @action markAsReaded = async (id: string) => {
    if (!this.authenticated) { return; }
    await this.client!.markAsReaded(id);
  }
  @action loadSession = async () => {
    if (this.authenticated && !this.session) {
      this.session = await this.client!.getSession();
    }
  }
  @action updateSubscription = async (id: string, config: string, name: string) => {
    if (!this.authenticated) { return; }
    await this.client!.updateSubscription(id, { config, name });
  }
  @action deleteSubscription = async (id: string) => {
    if (!this.authenticated) { return; }
    await this.client!.deleteSubscription(id);
  }
}
