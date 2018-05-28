import { observable, action, computed } from 'mobx';
import * as Interfaces from './api_interfaces';
import ApiClient from './client';

import store from 'store';
import * as cache from './cache';

export const TOKEN_KEY = 'token';

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

  markAsReaded = async (id: string) => {
    if (!this.authenticated) { return; }
    await this.client!.markAsReaded(id);
    cache.rmMessage(id);
  }
  @action loadSession = async () => {
    if (this.authenticated && !this.session) {
      this.session = await this.client!.getSession();
    }
  }
  updateSubscription = async (id: string, config: string, name: string) => {
    if (!this.authenticated) { return; }
    await this.client!.updateSubscription(id, { config, name });
    cache.rmSubscription(id);
  }
  deleteSubscription = async (id: string) => {
    if (!this.authenticated) { return; }
    await this.client!.deleteSubscription(id);
    cache.rmSubscription(id);
  }

  getMessage = async (id: string) => {
    const cached = cache.getMessage(id);
    if (cached) {
      return cached;
    } else {
      if (!this.authenticated) { throw new Error('未登入'); }
      const result = await this.client!.getMessage(id);
      cache.setMessage(result);
      return result;
    }
  }
  getSubscription = async (id: string) => {
    const cached = cache.getSubscription(id);
    if (cached) {
      return cached;
    } else {
      if (!this.authenticated) { throw new Error('未登入'); }
      const result = await this.client!.getSubscription(id);
      cache.setSubscription(result);
      return result;
    }
  }
  getService = async (id: string) => {
    const cached = cache.getService(id);
    if (cached) {
      return cached;
    } else {
      if (!this.authenticated) { throw new Error('未登入'); }
      const result = await this.client!.getService(id);
      cache.setService(result);
      return result;
    }
  }
  cacheSubscriptions = async (ids: string[]) => {
    const subscriptions = await Promise.all(
      Array.from(new Set(ids))
        .map(this.getSubscription));
    subscriptions.forEach(cache.setSubscription);
  }
  cacheServices = async (ids: string[]) => {
    const services = await Promise.all(
      Array.from(new Set(ids))
        .map(this.getService));
    services.forEach(cache.setService);
  }
}
