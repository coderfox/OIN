import { ExceptionFilter, Catch, NotFoundException } from "@nestjs/common";
import log from "../lib/log";
import * as Errors from "../lib/errors";
import { debug } from "../lib/config";

// tslint:disable:max-classes-per-file
@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  public catch() {
    throw new Errors.ApiEndpointNotFoundError();
  }
}
@Catch()
export class GenericErrorFilter implements ExceptionFilter {
  public catch(error: any, response: any) {
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
    response
      .status(error.status)
      .json({
        code: error.code,
        debug: (debug && error.baseError) ? {
          message: error.baseError.message,
          stack: error.baseError.stack,
          ...error.baseError,
        } : undefined,
      });
  }
}
