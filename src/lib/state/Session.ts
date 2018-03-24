import { observable, action } from 'mobx';

export default class SessionState {
  @observable token: string | null = null;

  @action setToken(token: string) {
    this.token = token;
  }
  @action removeToken(token: string) {
    this.token = null;
  }
}