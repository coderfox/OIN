import { observable, action, computed } from 'mobx';
import * as I from './api_interfaces';
import ApiClient from './client';

import * as cache from './cache';
import forage from 'localforage';

forage.config({
  name: 'sandra',
  storeName: 'kv',
});

export const TOKEN_KEY = 'token';

export default class SessionState {
  @observable public session?: I.Session;
  @computed
  public get authenticated() {
    if (!this.session) {
      return false;
    }
    if (Date.parse(this.session.expires_at) < Date.now()) {
      return false;
    }
    return true;
  }

  public client?: ApiClient;

  constructor() {
    forage
      .getItem<I.Session>(TOKEN_KEY)
      .then(token => token && this.setToken(token));
  }

  @action
  setToken = async (session: I.Session) => {
    this.client = new ApiClient(session.token);
    await forage.setItem(TOKEN_KEY, session);
    this.session = session;
  }
  @action
  removeToken = async () => {
    await forage.removeItem(TOKEN_KEY);
    this.session = undefined;
  }

  @action
  login = async (email: string, password: string) => {
    const session = await ApiClient.login(email, password);
    // tslint:disable-next-line:no-console
    console.log(session);
    await this.setToken(session);
    return session.token;
  }
  @action
  logout = async () => {
    await this.removeToken();
  }

  markAsReaded = async (id: string) => {
    if (!this.authenticated) {
      return;
    }
    await this.client!.markAsReaded(id);
    await cache.rmMessage(id);
  }
  @action
  loadSession = async () => {
    if (this.authenticated && !this.session) {
      this.session = await this.client!.getSession();
    }
  }
  updateSubscription = async (id: string, config: string, name: string) => {
    if (!this.authenticated) {
      return;
    }
    await this.client!.updateSubscription(id, { config, name });
    await cache.rmSubscription(id);
  }
  deleteSubscription = async (id: string) => {
    if (!this.authenticated) {
      return;
    }
    await this.client!.deleteSubscription(id);
    await cache.rmSubscription(id);
  }

  getMessage = async (id: string) => {
    const cached = await cache.getMessage(id);
    if (cached !== null) {
      return cached;
    } else {
      if (!this.authenticated) {
        throw new Error('未登入');
      }
      const result = await this.client!.getMessage(id);
      await cache.setMessage(result);
      return result;
    }
  }
  getSubscription = async (id: string) => {
    const cached = await cache.getSubscription(id);
    if (cached !== null) {
      return cached;
    } else {
      if (!this.authenticated) {
        throw new Error('未登入');
      }
      const result = await this.client!.getSubscription(id);
      await cache.setSubscription(result);
      return result;
    }
  }
  getService = async (id: string) => {
    const cached = await cache.getService(id);
    if (cached !== null) {
      return cached;
    } else {
      if (!this.authenticated) {
        throw new Error('未登入');
      }
      const result = await this.client!.getService(id);
      await cache.setService(result);
      return result;
    }
  }
  cacheSubscriptions = async (ids: string[]) => {
    const subscriptions = (await Promise.all(
      Array.from(new Set(ids))
        .map(this.getSubscription)
        .filter(s => s !== null),
    )) as I.Subscription[];
    subscriptions.map(await cache.setSubscription);
  }
  cacheServices = async (ids: string[]) => {
    const services = (await Promise.all(
      Array.from(new Set(ids))
        .map(this.getService)
        .filter(s => s !== null),
    )) as I.Service[];
    services.map(await cache.setService);
  }

  purgeSubscriptionCache = async () => cache.clearSubscription();
  purgeServiceCache = async () => cache.clearService();
}
