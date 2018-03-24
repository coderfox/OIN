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
}

export default ApiClient;