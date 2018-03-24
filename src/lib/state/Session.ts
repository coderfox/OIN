import { observable, action, computed } from 'mobx';
import * as Interfaces from '../api_interfaces';
import ApiClient from '../client';

const store = require('store');

const TOKEN_KEY = 'token';
const EXPIRES_KEY = 'token_expires';

export default class SessionState {
  @observable public token: string | null = null;
  @observable public expires?: Date;
  @computed public get authenticated() {
    if (!this.expires) { return false; }
    if (this.token === null) { return false; }
    if (this.expires < new Date()) { return false; }
    return true;
  }

  constructor() {
    const savedToken = store.get(TOKEN_KEY);
    const expiresAt = store.get(EXPIRES_KEY);
    this.setToken(savedToken === undefined ? null : savedToken, expiresAt);
  }

  @action setToken(token: string, expires?: Date) {
    store.set(TOKEN_KEY, token);
    store.set(EXPIRES_KEY, expires);
    this.token = token;
    this.expires = expires;
  }
  @action removeToken(token: string) {
    store.remove(TOKEN_KEY);
    store.remove(EXPIRES_KEY);
    this.token = null;
  }
  @action async login(email: string, password: string) {
    const session = await ApiClient.login(email, password);
    this.setToken(session.token, new Date(Date.parse(session.expires_at)));
    return session.token;
  }
}