import { observable, action, computed } from 'mobx';
import * as Interfaces from '../api_interfaces';
import ApiClient from '../client';
import { message } from 'antd';

const store = require('store');

const TOKEN_KEY = 'token';
const EXPIRES_KEY = 'token_expires';

export default class SessionState {
  @observable public token: string | null = null;
  @observable public expires?: Date;
  @observable public messages: Interfaces.Message[] = [];
  @observable public subscriptions: Interfaces.Subscription[] = [];
  @observable public services: Interfaces.Service[] = [];
  @computed public get authenticated() {
    if (!this.expires) { return false; }
    if (this.token === null) { return false; }
    if (this.expires < new Date()) { return false; }
    return true;
  }

  public client?: ApiClient;

  constructor() {
    const savedToken = store.get(TOKEN_KEY);
    const expiresAt = store.get(EXPIRES_KEY);
    this.setToken(savedToken === undefined ? null : savedToken, expiresAt);
  }

  @action setToken(token: string, expires?: Date) {
    this.client = new ApiClient(token);
    store.set(TOKEN_KEY, token);
    store.set(EXPIRES_KEY, expires);
    this.token = token;
    this.expires = expires;
  }
  @action removeToken() {
    store.remove(TOKEN_KEY);
    store.remove(EXPIRES_KEY);
    this.token = null;
    this.messages = [];
    this.subscriptions = [];
    this.services = [];
  }
  @action async login(email: string, password: string) {
    const session = await ApiClient.login(email, password);
    this.setToken(session.token, new Date(Date.parse(session.expires_at)));
    return session.token;
  }

  @action refreshMessages = async () => {
    if (!this.authenticated) { return; }
    try {
      this.messages = await this.client!.getMessages();
    } catch (ex) {
      message.error('加载消息失败 - '.concat(ex.message));
    }
  }
  @action refreshSubscriptions = async () => {
    if (!this.authenticated) { return; }
    try {
      this.subscriptions = await this.client!.getSubscriptions();
    } catch (ex) {
      message.error('加载订阅列表失败 - '.concat(ex.message));
    }
  }
  @action refreshServices = async () => {
    if (!this.authenticated) { return; }
    try {
      this.services = await this.client!.getServices();
    } catch (ex) {
      message.error('加载服务列表失败 - '.concat(ex.message));
    }
  }
  @action markAsReaded = async (id: string) => {
    if (!this.authenticated) { return; }
    try {
      await this.client!.markAsReaded(id);
      this.messages.splice(this.messages.findIndex(value => value.id === id), 1);
    } catch (ex) {
      message.error('标记已读失败' + ex.message);
    }
  }
}