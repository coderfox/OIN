import axios, { AxiosResponse, AxiosBasicCredentials } from "axios";
import { RegisterContextual, TestContext } from "ava";
import { start, stop } from "../../server";
import { getConnection } from "typeorm";
import { buildApplication } from "../../app";
// tslint:disable-next-line:no-var-requires
const axiosist = require("axiosist");

export const request = async <T = any>(
  method: string,
  url: string,
  auth?: AxiosBasicCredentials | string,
  data?: any,
  params?: any,
): Promise<AxiosResponse<T>> => {
  const server = await buildApplication();
  const result = await axios({
    method,
    baseURL: "http://127.0.0.1:3000",
    url,
    params,
    data,
    ...(typeof auth === "undefined"
      ? undefined
      : typeof auth === "string"
        ? {
            headers: {
              Authorization: "Bearer ".concat(auth),
            },
          }
        : { auth }),
    validateStatus: () => true,
    adapter: axiosist.createAdapter(server.getHttpServer()),
  });
  return result;
};
export const requestAssert = async <T = any>(
  t: TestContext,
  endpoint: string,
  assertion: string,
  auth?: AxiosBasicCredentials | string,
  data?: any,
  params?: any,
): Promise<T> => {
  const [method, url] = endpoint.split(" ");
  const result = await request<T>(method, url, auth, params, data);
  const [status, code] = assertion.split(" ");
  t.is(result.status, +status, "HTTP status");
  if (!(+status >= 200 && +status < 300)) {
    t.is((result.data as any).code, code, "error code");
  }
  return result.data;
};
export const init = async (test: RegisterContextual<any>) => {
  test.before(async () => {
    process.env.LOG_LEVEL = "silent";
    process.env.NODE_ENV = "test";
    await start();
    await clearDb();
  });
  test.after.always(async () => {
    await clearDb();
    await stop();
  });
};
export const clearDb = () =>
  getConnection().query(
    `TRUNCATE "cofirmation", "message", "service", "session", "user" RESTART IDENTITY CASCADE;`,
  );
export const DATE_REGEXP = /^\d{4,4}-\d{2,2}-\d{2,2}T\d{2,2}:\d{2,2}:\d{2,2}.\d{3,3}Z$/;
