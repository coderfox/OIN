import User from "../models/user";
import Session from "../models/session";

// tslint:disable:max-classes-per-file
export class ApiError extends Error {
  public readonly code: string = "UNDEFINED_ERROR";
  public readonly status: number = 500;
  constructor(code: string, httpCode: number) {
    super(code);
    this.name = code + "_Error";
    this.code = code;
    this.status = httpCode;
  }
}
export class InvalidRequestBodyError extends ApiError {
  constructor() {
    super("INVALID_REQUEST_BODY_TYPE", 400);
  }
}
export class ApiEndpointNotFoundError extends ApiError {
  constructor() {
    super("API_ENDPOINT_NOT_FOUND", 404);
  }
}
export class NotImplementedError extends ApiError {
  constructor() {
    super("NOT_IMPLEMENTED", 501);
  }
}
export class InternalServerError extends ApiError {
  constructor(public readonly baseError: any) {
    super("INTERNAL_SERVER_ERROR", 500);
  }
}
export class AuthenticationNotFoundError extends ApiError {
  constructor(public readonly expected?: string) {
    super("AUTHENTICATION_NOT_FOUND", 401);
  }
}
export class CorruptedAuthorizationHeaderError extends ApiError {
  constructor() {
    super("CORRUPTED_AUTHORIZATION_HEADER", 400);
  }
}
export class UserNotFound403Error extends ApiError {
  constructor(public readonly email: string) {
    super("USER_NOT_FOUND", 403);
  }
}
export class UserNotFoundByIdError extends ApiError {
  constructor(public readonly id: string) {
    super("USER_NOT_FOUND", 404);
  }
}
export class UserNotFoundByEmailError extends ApiError {
  public readonly email: string;
  constructor(email: string) {
    super("USER_NOT_FOUND", 404);
    this.email = email;
  }
}
export class PasswordMismatchError extends ApiError {
  public readonly user: User;
  public readonly wrongPassword: string;
  constructor(user: User, wrongPassword: string) {
    super("PASSWORD_MISMATCH", 403);
    this.user = user;
    this.wrongPassword = wrongPassword;
  }
}
export class InvalidAuthenticationTypeError extends ApiError {
  constructor(public readonly right: string, public readonly wrong: string) {
    super("INVALID_AUTHENTICATION_TYPE", 401);
  }
}
export class TokenExpiredError extends ApiError {
  public readonly session: Session;
  constructor(session: Session) {
    super("EXPIRED_TOKEN", 403);
    this.session = session;
  }
}
export class TokenInvalidError extends ApiError {
  public readonly token: string;
  constructor(token: string) {
    super("INVALID_TOKEN", 403);
    this.token = token;
  }
}
export class InsufficientPermissionError extends ApiError {
  public readonly session: Session;
  public readonly permission: string;
  constructor(session: Session, permission: string) {
    super("INSUFFICIENT_PERMISSION", 403);
    this.session = session;
    this.permission = permission;
  }
}
export class BadRequestError extends ApiError {
  constructor(public readonly descriptor: string) {
    super("BAD_REQUEST", 400);
  }
}
export class DuplicateEmailError extends ApiError {
  public readonly email: string;
  constructor(email: string) {
    super("DUPLICATED_EMAIL", 303);
    this.email = email;
  }
}
export class ConfirmationNotFoundError extends ApiError {
  public readonly confirmationCode: string;
  constructor(code: string) {
    super("CONFIRMATION_NOT_FOUND", 404);
    this.confirmationCode = code;
  }
}
export class NewEmailOrPasswordNotSuppliedError extends ApiError {
  constructor() {
    super("NEW_EMAIL_OR_PASSWORD_NOT_SUPPLIED", 400);
  }
}
export class PasswordNotSuppliedError extends ApiError {
  constructor() {
    super("PASSWORD_NOT_SUPPLIED", 400);
  }
}
export class EmailNotSuppliedError extends ApiError {
  constructor() {
    super("EMAIL_NOT_SUPPLIED", 400);
  }
}
export class MessageNotExistsError extends ApiError {
  public readonly id: string;
  constructor(id: string) {
    super("MESSAGE_NOT_EXISTS", 404);
    this.id = id;
  }
}
export class RpcError extends ApiError {
  constructor(code: string) {
    super(code, 500);
  }
}
export class RpcInternalServerError extends ApiError {
  constructor(public readonly baseError: any) {
    super("INTERNAL_SERVER_ERROR", 503);
  }
}
export class RpcInvalidParametersError extends RpcError {
  constructor(public readonly descriptor: string) {
    super("INVALID_PARAMETERS");
  }
}
export class RpcInsufficientPermissionError extends RpcError {
  constructor() {
    super("INSUFFICIENT_PERMISSION");
  }
}
export class SubscriptionNotExistsError extends ApiError {
  public readonly id: string;
  constructor(id: string) {
    super("SUBSCRIPTION_NOT_EXISTS", 404);
    this.id = id;
  }
}
export class ServiceNotExistsError extends ApiError {
  constructor(public readonly id: string) {
    super("SERVICE_NOT_EXISTS", 404);
  }
}
export class RpcInvalidTokenError extends RpcError {
  constructor(public readonly token: string) {
    super("INVALID_TOKEN");
  }
}
export class RpcChannelNotFoundError extends RpcError {
  constructor(public readonly channel: string) {
    super("CHANNEL_NOT_FOUND");
  }
}
