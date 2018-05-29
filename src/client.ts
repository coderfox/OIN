import axios from "axios";
import * as config from "./config";
import {
  ApiResult,
  RegisterServiceRequest, RegisterServiceResponse,
  GetChannelsRequest, GetChannelsResponse,
  CreateMessageRequest, CreateMessageResponse,
  ReportEventRequest, ReportEventResponse,
} from "./types";

class ApiClient {
  private token?: string;
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string) {
  }
  private static call = async <TReq, TRes>(fn: string, data: TReq): Promise<TRes> => {
    const result = (await axios.post<ApiResult<TRes>>(config.SANDRA_BACKEND_URL + "/rpc/" + fn, data)).data as any;
    if (result.result) {
      return result.result;
    }
    if (result.code) {
      throw new ApiError(result.code);
    }
    throw new ApiError("INVALID_RESULT");
  }
  public register = async () => {
    const token = await ApiClient.call<RegisterServiceRequest, RegisterServiceResponse>("register_service", {
      deploy_token: config.SANDRA_DEPLOY_TOKEN,
      metadata: {
        id: this.id,
        name: this.name,
        description: this.description,
      },
    });
    this.token = token;
    return token;
  }
  public getChannels = async () => {
    if (!this.token) { throw new ApiError("SERVICE_NOT_REGISTERED"); }
    return await ApiClient.call<GetChannelsRequest, GetChannelsResponse>("get_channels", {
      token: this.token,
    });
  }
  public createMessage = async (channel: string, title: string, summary: string, content: string) => {
    if (!this.token) { throw new ApiError("SERVICE_NOT_REGISTERED"); }
    return await ApiClient.call<CreateMessageRequest, CreateMessageResponse>("create_message", {
      token: this.token,
      channel_id: channel,
      message: { title, summary, content },
    });
  }
  public reportEvent = async (channel: string, status = true, message = "succeed") => {
    if (!this.token) { throw new ApiError("SERVICE_NOT_REGISTERED"); }
    return await ApiClient.call<ReportEventRequest, ReportEventResponse>("report_event", {
      token: this.token,
      channel_id: channel,
      event: { status, message },
    });
  }
}

// tslint:disable-next-line:max-classes-per-file
export class ApiError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = code + "_Error";
    this.code = code;
  }
}

export default ApiClient;
