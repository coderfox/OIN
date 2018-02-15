import { ExceptionFilter, Catch, NotFoundException } from "@nestjs/common";
import log from "../lib/log";
import * as Errors from "../lib/errors";

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  public catch() {
    throw new Errors.ApiEndpointNotFoundError();
  }
}
// tslint:disable-next-line:max-classes-per-file
@Catch()
export class GenericErrorFilter implements ExceptionFilter {
  public catch(error: any, response: any) {
    if (!(error instanceof Errors.ApiError)) {
      log.error(error, "internal server error");
      error = new Errors.InternalServerError(error);
    } else {
      log.info(error, "handled server error");
    }
    response
      .status(error.status)
      .json({
        code: error.code,
        debug: error.baseError ? {
          message: error.baseError.message,
          stack: error.baseError.stack,
          ...error.baseError,
        } : undefined,
      });
  }
}
