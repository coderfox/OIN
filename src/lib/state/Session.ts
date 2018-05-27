import { observable, action, computed } from 'mobx';
import * as Interfaces from '../api_interfaces';
import ApiClient from '../client';

const store = require('store');

const TOKEN_KEY = 'token';

const compare = (a: { created_at: string }, b: { created_at: string }) =>
  Date.parse(b.created_at) - Date.parse(a.created_at);
export default class SessionState {
  @observable public messages: Interfaces.Message[] = [];
  @observable public subscriptions: Interfaces.Subscription[] = [];
  @observable public services: Interfaces.Service[] = [];
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
    this.messages = [];
    this.subscriptions = [];
    this.services = [];
    this.session = undefined;
  }
  @action login = async (email: string, password: string) => {
    const session = await ApiClient.login(email, password);
    this.setToken(session);
    return session.token;
  }

  @action retrieveMessages = async (forced = false) => {
    if (!this.authenticated) { return; }
    if (!forced && this.messages.length > 0) { return; }
    this.messages = (await this.client!.getMessages()).sort(compare);
  }
  @action retrieveSubscriptions = async (forced = false) => {
    if (!this.authenticated) { return; }
    if (!forced && this.subscriptions.length > 0) { return; }
    this.subscriptions = (await this.client!.getSubscriptions()).sort(compare);
  }
  @action retrieveServices = async (forced = false) => {
    if (!this.authenticated) { return; }
    if (!forced && this.services.length > 0) { return; }
    this.services = await this.client!.getServices();
  }
  @action markAsReaded = async (id: string) => {
    if (!this.authenticated) { return; }
    await this.client!.markAsReaded(id);
    const msg = this.messages.find(value => value.id === id);
    if (msg) { msg.readed = true; }
  }
  @action loadSession = async () => {
    if (this.authenticated && !this.session) {
      this.session = await this.client!.getSession();
    }
  }
  @action retrieveLatestData = async () => {
    await this.retrieveServices(true);
    await this.retrieveSubscriptions(true);
    await this.retrieveMessages(true);
  }
  @action retrieveLatestServices = async () => {
    await this.retrieveServices(true);
  }
  @action updateSubscriptionConfig = async (id: string, config: string) => {
    if (!this.authenticated) { return; }
    this.subscriptions[
      this.subscriptions.findIndex(value => value.id === id)
    ].config = (await this.client!.updateSubscription(id, { config })).config;
  }
  @action deleteSubscription = async (id: string) => {
    if (!this.authenticated) { return; }
    await this.client!.deleteSubscription(id);
    this.subscriptions[
      this.subscriptions.findIndex(value => value.id === id)
    ].deleted = true;
  }
}