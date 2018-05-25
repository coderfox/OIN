// tslint:disable:interface-name

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
export interface ApiSuccess<T> {
  result: T;
}
export interface ApiFailure {
  code: string;
}
export interface RegisterServiceRequest {
  deploy_token: string;
  metadata: {
    id: string;
    name: string;
    description: string;
  };
}
export type RegisterServiceResponse = string;
export interface GetChannelsRequest {
  token: string;
}
export interface Channel {
  config: string;
  id: string;
}
export type GetChannelsResponse = Channel[];
export interface CreateMessageRequest {
  token: string;
  channel_id: string;
  message: {
    title: string;
    summary: string;
    content: string;
  };
}
export type CreateMessageResponse = true;
