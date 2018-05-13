import { ExceptionFilter, Catch, NotFoundException, ArgumentsHost } from "@nestjs/common";
import log from "../lib/log";
import * as Errors from "../lib/errors";
import { debug } from "../lib/config";
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
    Raven.captureException(error, { req: http.getRequest() }, (sendErr, eventId) => {
      // This callback fires once the report has been sent to Sentry
      if (sendErr) {
        log.error("sentry error", sendErr);
      } else {
        log.error("sentry captured", eventId);
      }
    });
    response
      .status(error.status)
      .json({
        code: error.code,
        api_error: debug && error,
        base_error: (debug && error.baseError) ? {
          message: error.baseError.message,
          stack: error.baseError.stack,
          ...error.baseError,
        } : undefined,
      });
  }
}
