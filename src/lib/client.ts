import axios, { AxiosBasicCredentials } from 'axios';
import * as Interfaces from './api_interfaces';

class ApiClient {
  public static register = async (email: string, password: string) => {
    return await ApiClient.post<Interfaces.User, {
      email: string,
      password: string,
    }>('/users', { email, password });
  }
  public static login = async (email: string, password: string) => {
    return await ApiClient.put<Interfaces.Session, {}>('/session', {}, { username: email, password: password });
  }

  private static constructApiUrl = (url: string) =>
    (process.env.REACT_APP_API_ROOT || 'http://127.0.0.1:5000').concat(url)
  private static constructOptions = (auth?: AxiosBasicCredentials | string) =>
    typeof (auth) === 'undefined' ? undefined :
      typeof (auth) === 'string' ? {
        headers: {
          'Authorization': 'Bearer '.concat(auth)
        }
      } : { auth }
  private static get = async <T>(url: string, auth?: AxiosBasicCredentials | string): Promise<T> => {
    const result = await axios.get(
      ApiClient.constructApiUrl(url),
      ApiClient.constructOptions(auth)
    );
    return result.data;
  }
  private static post = async <TRes, TReq>(
    url: string,
    data: TReq,
    auth?: AxiosBasicCredentials | string
  ): Promise<TRes> => {
    const result = await axios.post(
      ApiClient.constructApiUrl(url),
      data,
      ApiClient.constructOptions(auth)
    );
    return result.data;
  }
  private static put = async <TRes, TReq>(
    url: string,
    data: TReq,
    auth?: AxiosBasicCredentials | string
  ): Promise<TRes> => {
    const result = await axios.put(
      ApiClient.constructApiUrl(url),
      data,
      ApiClient.constructOptions(auth)
    );
    return result.data;
  }
  private static delete = async <T>(
    url: string,
    auth?: AxiosBasicCredentials | string
  ): Promise<T> => {
    const result = await axios.delete(
      ApiClient.constructApiUrl(url),
      ApiClient.constructOptions(auth)
    );
    return result.data;
  }

  constructor(private token: string) {
  }
  public get = async <T>(url: string): Promise<T> =>
    ApiClient.get<T>(url, this.token)
  public post = async <TRes, TReq>(url: string, data: TReq): Promise<TRes> =>
    ApiClient.post<TRes, TReq>(url, data, this.token)
  public put = async <TRes, TReq>(url: string, data: TReq): Promise<TRes> =>
    ApiClient.put<TRes, TReq>(url, data, this.token)
  public delete = async <T>(url: string): Promise<T> =>
    ApiClient.delete<T>(url, this.token)

  public getMessage = (id: string) =>
    this.get<Interfaces.Message>('/messages/'.concat(id))
  public getMessages = () =>
    this.get<Interfaces.Message[]>('/messages/mine')
  public getServices = () =>
    this.get<Interfaces.Service[]>('/services')
  public getSubscriptions = () =>
    this.get<Interfaces.Subscription[]>('/subscriptions/mine')
  public markAsReaded = (id: string) =>
    this.post<{ readed: boolean }, { readed: true }>('/messages/'.concat(id), { readed: true })
  public getSession = () =>
    this.get<Interfaces.Session>('/session')
  public createSubscription = (service: string, config: string) =>
    this.post<Interfaces.Subscription, {
      service: string,
      config: string
    }>('/subscriptions', { service, config })
}

export default ApiClient;