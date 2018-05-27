import { ExceptionFilter, Catch, NotFoundException, ArgumentsHost } from "@nestjs/common";
import log from "../lib/log";
import * as Errors from "../lib/errors";
import { DEBUG } from "../lib/config";
import Raven from "raven";

@Catch()
export class GenericErrorFilter implements ExceptionFilter {
  public catch(error: any, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse();
    if (error instanceof NotFoundException) {
      error = new Errors.ApiEndpointNotFoundError();
    }
    if (!(error instanceof Errors.ApiError)) {
      log.error(error, "internal server error");
      error = new Errors.InternalServerError(error);
    } else {
      log.info(error, "handled server error");
      if (error instanceof Errors.AuthenticationNotFoundError) {
        response.set("WWW-Authenticate", error.expected);
      }
      if (error instanceof Errors.InvalidAuthenticationTypeError) {
        response.set("WWW-Authenticate", error.right);
      }
    }
    Raven.captureException(error.baseError || error, {
      req: http.getRequest(),
      level: error.baseError ? "info" : "error",
    }, (sentry_err, event_id) => {
      // This callback fires once the report has been sent to Sentry
      if (sentry_err) {
        log.error("sentry error", sentry_err);
      } else {
        log.info("sentry captured", event_id);
      }
    });
    response
      .status(error.status)
      .json({
        code: error.code,
        api_error: DEBUG && error,
        base_error: (DEBUG && error.baseError) ? {
          message: error.baseError.message,
          stack: error.baseError.stack,
          ...error.baseError,
        } : undefined,
      });
  }
}
