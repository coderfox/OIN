# Backend REST APIs

[TOC]

## Basic Conventions

### Request and Response

The request can be in `application/x-www-form-urlencoded`, `application/json` or `multipart/form-data`, and charset should be `utf8`. However, when a complex data struct is defined in the API document, the request must be in `application/json`. The reaction to other request data types is undefined, but most times the server will throw a `400 Bad Request - INVALID_REQUEST_BODY_TYPE` error.

The server will always give a response body of `application/json` in `utf8`. The response JSON string can be either beautified or not.

When the HTTP response code ranges over `400`, it means there is an error. When an error occurs, the server will omit response in the following format:

| Name  | Type   | Description |
| ----- | ------ | ----------- |
| /code | string | error code  |

For example:

```json
{
    "code": "INTERNAL_SERVER_ERROR"
}
```

Any request or responses beyond the conventions or the documents should be regarded as an error of the opposite side. For client side, the APP should indicate the user that the server encountered errors; for server side, a `400 Bad Request` should be thrown as each API describes below.

### Authentication

There are two types of authentication used by REST API: `Basic` and `Bearer`. Unless specified explicitly, all API calls should be authenticated by *Bearer Authentication*.

When calling an API requiring authentication without providing either types, the server will throw `401 Unauthorized - AUTHENTICATION_NOT_FOUND` with header `WWW-Authenticate: TYPE`, where `TYPE` is the required authentication type.

When an authorization header does not match [RFC 6750](https://tools.ietf.org/html/rfc6750) or [RFC 7617](https://tools.ietf.org/html/rfc7617), the server will throw a `400 Bad Request - CORRUPTED_AUTHORIZATION_HEADER` error.

#### Basic

The client should provide email as username and unhashed password as password. The detailed specifications can be found at [RFC 7617](https://tools.ietf.org/html/rfc7617).

Example:

```http
GET /some_api_endpoint HTTP/1.1
Authorization: Basic dXNlckBleGFtcGxlLmNvbTpwYXNzd29yZA==
```

This authentication type is only used when the API document requires and indicates, and does not support permission scopes. In other words, it always grants user the permission when calling those API endpoints requiring *Basic Authentication*, but it cannot grants permission when the API endpoint does not specify support of *Basic Authentication* explicitly.

When the user with the indicated email does not exist, the server will throw `403 Forbidden - USER_NOT_FOUND`.

When the password mismatches the user's, the server will throw `403 Forbidden - PASSWORD_MISMATCH`.

When calling an API endpoint which does not support *Bearer Authentication* (requires *Basic Authentication*), the server will throw `401 Unauthorized - INVALID_AUTHENTICATION_TYPE` with header `WWW-Authenticate: Basic`.

#### Bearer

The client should indicate a token with each request, in request header `Authorization`. The detailed specifications can be found at [RFC 6750](https://tools.ietf.org/html/rfc6750). The token will always be a UUID v4 compliant string, see [RFC 4122](https://tools.ietf.org/html/rfc4122).

Example:

```http
GET /some_api_endpoint HTTP/1.1
Authorization: Bearer 8fceef49-f673-4670-bf73-2dc7bb35634a
```

When the token is expired, the server will throw a `403 Forbidden - EXPIRED_TOKEN` error.

When the token is invalid (the session or the user corresponding to the token does not exists, in other words, a faked token), the server will throw a `403 Forbidden - INVALID_TOKEN` error.

When the token's permission is insufficient to execute the action, the server will throw a `403 Forbidden - INSUFFICIENT_PERMISSION` error.

You can call `PUT /session` to acquire a token as described below, use `GET /session` to gain the information of the token provided, and use `DELETE /session` to terminate a session.

When calling an API endpoint which does not support *Basic Authentication* (requires *Bearer Authentication*), the server will throw `401 Unauthorized - INVALID_AUTHENTICATION_TYPE` with header `WWW-Authenticate: Bearer`.

### Time

All times are of `string` type in JavaScript `Date#toJSON` returning value format. The timezone will be UTC, and the client should convert it to the users' timezone.

Example:

```
2015-10-26T07:46:36.611Z
```

See:

[Date.prototype.toJSON()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toJSON)

### Errors

Here are some common errors for the API server:

| HTTP Code | Error Code             | Description |
| --------- | ---------------------- | ----------- |
| 404       | API_ENDPOINT_NOT_FOUND |             |
| 500       | INTERNAL_SERVER_ERROR  |             |
| 501       | NOT_IMPLEMENTED        |             |

## User

### Describing User

| Path               | Type    | Description                              |
| ------------------ | ------- | ---------------------------------------- |
| /id                | number  | user id                                  |
| /email             | string  |                                          |
| /permissions       | object  |                                          |
| /permissions/admin | boolean |                                          |
| /createdAt         | string  | time of creation, in conventional time format |
| /updatedAt         | string  | time of last update, in conventional time format |

Example:

```json
{
    "id": 42,
    "email": "user@example.com",
    "permissions": {
        "admin": false
    },
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:16:52.669Z"
}
```

### List Users

`GET` /users

#### Authentication

*admin permission* required.

#### Request

**URL Params**

| Name  | Description              |
| ----- | ------------------------ |
| limit | optional, defaults to 50 |
| skip  | optional, defaults to 0  |

**Header**

| Name         | Description              |
| ------------ | ------------------------ |
| X-Page-Limit | optional, defaults to 50 |
| X-Page-Skip  | optional, defaults to 0  |

The variables in header is prior to those in URL params.

#### Response

**Code:** 200 OK

**Header:** nothing

**Content:** array of conventional user object

#### Errors

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
GET /users HTTP/1.1
Authorization: Bearer 8fceef49-f673-4670-bf73-2dc7bb35634a
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
    {
        "id": 42,
        "email": "user@example.com",
        "permissions": {
            "admin": false
        },
        "createdAt": "2017-06-22T07:16:52.669Z",
        "updatedAt": "2017-06-22T07:16:52.669Z"
    }, {
        "id": 43,
        "email": "userb@example.com",
        "permissions": {
            "admin": true
        },
        "createdAt": "2017-06-22T07:16:52.669Z",
        "updatedAt": "2017-06-22T07:16:52.669Z"
    }
]
```

### Create User - Step 1

`POST` /users

#### Authentication

Performing such operation requires *confirm code* from current email address, and this API just sends an email of *confirm code* to current email address.

This API does not require any authentication.

#### Request

**URL Params:** nothing

**Body**

| Name     | Description |
| -------- | ----------- |
| email    | email       |
| password | password    |

**Header:** nothing

#### Response

**Code:** 202 Accepted

**Header:** nothing

**Content:** nothing

#### Errors

| HTTP Code | Error Code            | Description                              |
| --------- | --------------------- | ---------------------------------------- |
| 303       | DUPLICATED_EMAIL      | email exists                             |
| 303       | PENDING_EMAIL_CONFIRM | a confirm email has already been sent to the address |
| 400       | INVALID_PASSWORD      | password limit exceeded; the password is either too short, or too long, or not secure enough |
| 400       | INVALID_EMAIL         |                                          |

#### Example

**Request**

```http
POST /users HTTP/1.1
Content-Type: application/x-www-form-urlencoded; charset=utf-8

email=test%40example.com&password=123456
```

**Response**

```http
HTTP/1.1 202 Accepted
Content-Type: application/json

{}
```

### Create User - Step 2

`POST` /users/confirmations

#### Authentication

It is required to use *Bearer Authentication*, where the token is the *confirm code*.

#### Request

**URL Params:** nothing

**Body:** nothing

**Header:** nothing

#### Response

**Code:** 200 OK

**Header**

| Name     | Description              |
| -------- | ------------------------ |
| Location | link to the created user |

**Content:** conventional user object

#### Errors

| HTTP Code | Error Code             | Description |
| --------- | ---------------------- | ----------- |
| 403       | CONFIRMATION_CODE_USED |             |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
POST /users/confirmations HTTP/1.1
Authorization: Bearer 4c0de676-5289-4c74-ab96-2a246d4fe636
```

**Response**

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /users/42

{
    "id": 42,
    "email": "user@example.com",
    "permissions": {
        "admin": false
    },
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:16:52.669Z"
}
```

### Lookup User

`GET` /users/:id

#### Authentication

When logged in as normal user, only the user according to the token can be shown.

Only when logged in as an admin, can all users be shown.

#### Request

**URL Params:** nothing

**Header:** nothing

#### Response

**Code:** 200 OK

**Header:** nothing

**Content:** conventional user object

#### Errors

| HTTP Code | Error Code     | Description    |
| --------- | -------------- | -------------- |
| 404       | USER_NOT_FOUND | user not found |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
GET /users/42 HTTP/1.1
Authorization: Bearer 8fceef49-f673-4670-bf73-2dc7bb35634a
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "id": 42,
    "email": "user@example.com",
    "permissions": {
        "admin": false
    },
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:16:52.669Z"
}
```

### Update User Email or Password by Current Password

`PUT` /users/:id/(email|password)

#### Authentication

When logged in as an admin, can all users be changed, and it should be authenticated with *Bearer Authentication*.

For normal users, it should be authenticated with *Basic Authentication*.

#### Request

**URL Params:** nothing

**Body**

| Path | Type   | Description               |
| ---- | ------ | ------------------------- |
| /    | string | new email or new password |

The body is expected to be `application/json`.

**Header:** nothing

#### Response

**Code:** 200 OK

**Header:** nothing

**Content:**

When updating email:

| Path | Type   | Description |
| ---- | ------ | ----------- |
| /    | string | new email   |

When updating password:

| Path | Type   | Description  |
| ---- | ------ | ------------ |
| /    | string | empty string |

#### Errors

| HTTP Code | Error Code                         | Description    |
| --------- | ---------------------------------- | -------------- |
| 404       | USER_NOT_FOUND                     | user not found |
| 400       | NEW_EMAIL_OR_PASSWORD_NOT_SUPPLIED |                |
| 400       | INVALID_NEW_EMAIL                  |                |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
PUT /users/42/email HTTP/1.1
Authorization: Basic dXNlckBleGFtcGxlLmNvbToxMjM0NTY=

"new@example.com"
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

"new@example.com"
```

### Update User Email or Password by Email Confirmation - Step 1

`PUT` /users/:id/(email|password)/confirmation

#### Authentication

Performing such operation requires *confirm code* from current email address, and this API just sends an email of *confirm code* to current email address.

no authentication required

#### Request

**URL Params:** nothing

**Body**

| Name     | Description        |
| -------- | ------------------ |
| email    | email, optional    |
| password | password, optional |
| status   | exactly `started`  |

Either `email` or `password` should be supplied according to the url.

**Header:** nothing

#### Response

**Code:** 202 Accepted

**Header:** nothing

**Content:** current email

#### Errors

| HTTP Code | Error Code                     | Description                              |
| --------- | ------------------------------ | ---------------------------------------- |
| 404       | USER_NOT_FOUND                 | user not found                           |
| 401       | EMAIL_OR_PASSWORD_NOT_SUPPLIED |                                          |
| 400       | REQUEST_BODY_MISMATCH_URL      | parameters supplied in request body mismatches url |
| 400       | INVALID_STATUS                 | `status` is not `started`                |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
POST /users/42/email/confirmation HTTP/1.1

email=new%40example.com&status=started
```

**Response**

```http
HTTP/1.1 202 Accepted
Content-Type: application/json

"user@example.com"
```

### Update User Email or Password by Email Confirmation - Step 2

`PUT` /users/:id/(email|password)/confirmation

#### Authentication

It is required to use token auth, where the token is the *confirm code*.

#### Request

**URL Params:** nothing

**Body:**

| Name   | Description         |
| ------ | ------------------- |
| status | exactly `confirmed` |

**Header:** nothing

#### Response

**Code:** 200 OK

**Header:** nothing

**Content:**

When updating email:

| Path | Type   | Description |
| ---- | ------ | ----------- |
| /    | string | new email   |

When updating password:

| Path | Type   | Description  |
| ---- | ------ | ------------ |
| /    | string | empty string |

#### Errors

| HTTP Code | Error Code     | Description                              |
| --------- | -------------- | ---------------------------------------- |
| 404       | USER_NOT_FOUND |                                          |
| 401       | NOT_STARTED    | step 1 API has not been called           |
| 401       | USER_MISMATCH  | the id provided in url mismatches the id of the *confirm code* |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
PUT /users/42/email/confirmation HTTP/1.1
Authorization: Bearer 8fceef49-f673-4670-bf73-2dc7bb35634a

status=confirmed
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

"new@example.com"
```

### Delete User

`DELETE` /users/:id

#### Authentication

When logged in as normal user, only the user according to the token can be deleted, and *Basic Authentication* is required.

Only when logged in as an admin, can all users be deleted.

#### Request

**URL Params:** nothing

**Header:** nothing

#### Response

**Code:** 200 OK

**Header:** nothing

**Content:** conventional user object

#### Errors

| HTTP Code | Error Code              | Description             |
| --------- | ----------------------- | ----------------------- |
| 404       | USER_NOT_FOUND          | user not found          |
| 403       | INSUFFICIENT_PERMISSION | insufficient permission |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
DELETE /users/42 HTTP/1.1
```

**Response**

```http
HTTP/1.1 200 OK
Authorization: Bearer 8fceef49-f673-4670-bf73-2dc7bb35634a
Content-Type: application/json

{
    "id": 42,
    "email": "user@example.com",
    "permissions": {
        "admin": false
    },
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:16:52.669Z"
}
```

## Authentication

### Describing Session

| Path               | Type    | Description                              |
| ------------------ | ------- | ---------------------------------------- |
| /id                | number  | session id                               |
| /token             | string  | *token*                                  |
| /user              | object  | user object                              |
| /permissions       | object  |                                          |
| /permissions/admin | boolean |                                          |
| /createdAt         | string  | time of creation, in conventional time format |
| /updatedAt         | string  | time of last refresh, in conventional time format |
| /expiresAt         | string  | time of expiration, in conventional time format |

Example:

```json
{
    "token": "8fceef49-f673-4670-bf73-2dc7bb35634a",
    "user": {
        "id": 42,
        "email": "user@example.com",
        "permissions": {
            "admin": false
        },
        "createdAt": "2017-06-22T07:16:52.669Z",
        "updatedAt": "2017-06-22T07:16:52.669Z"
    },
    "permissions": {
        "admin": false
    },
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:16:52.669Z",
    "expiresAt": "2017-06-23T07:16:52.669Z"
}
```

The token expiration is automatically extended as requests are performed.

### Create Session

`PUT` /session

By this request, a token is generated and the default expiration is 7 days and will be extended as API calls are performed.

#### Authentication

Conventional *Basic Authentication*.

#### Request

**URL Params:** nothing

Request **Body**

| Path               | Type    | Description |
| ------------------ | ------- | ----------- |
| /permissions       | object  | optional    |
| /permissions/admin | boolean | optional    |

**Header:** nothing

#### Response

**Code:** 200 OK

**Header:** nothing

**Content:** conventional session object

#### Errors

| HTTP Code | Error Code              | Description                         |
| --------- | ----------------------- | ----------------------------------- |
| 403       | INSUFFICIENT_PERMISSION | requested permission beyond control |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
PUT /session HTTP/1.1
Authorization: Basic dXNlckBleGFtcGxlLmNvbTpwYXNzd29yZA==
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "token": "8fceef49-f673-4670-bf73-2dc7bb35634a",
    "user": {
        "id": 42,
        "email": "user@example.com",
        "permissions": {
            "admin": false
        },
        "createdAt": "2017-06-22T07:16:52.669Z",
        "updatedAt": "2017-06-22T07:16:52.669Z"
    },
    "permissions": {
        "admin": false
    },
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:16:52.669Z",
    "expiresAt": "2017-06-23T07:16:52.669Z"
}
```

### Get Session Detail

`GET` /session

#### Authentication

This API requires token auth, and will not extend token expiration.

#### Request

**URL Params:** nothing

**Header:** nothing

#### Response

**Code:** 200 OK

**Header:** nothing

**Content:** conventional session object

#### Errors

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
GET /session HTTP/1.1
Authorization: Bearer 8fceef49-f673-4670-bf73-2dc7bb35634a
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "token": "8fceef49-f673-4670-bf73-2dc7bb35634a",
    "user": {
        "id": 42,
        "email": "user@example.com",
        "permissions": {
            "admin": false
        },
        "createdAt": "2017-06-22T07:16:52.669Z",
        "updatedAt": "2017-06-22T07:16:52.669Z"
    },
    "permissions": {
        "admin": false
    },
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:16:52.669Z",
    "expiresAt": "2017-06-23T07:16:52.669Z"
}
```

### Terimate Session

`DELETE` /session

This will set the expire time of session to now.

#### Authentication

This API requires token auth, and will not extend token expiration.

#### Request

**URL Params:** nothing

**Header:** nothing

#### Response

**Code:** 200 OK

**Header:** nothing

**Content:** conventional session object

#### Errors

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
DELETE /session HTTP/1.1
Authorization: Bearer 8fceef49-f673-4670-bf73-2dc7bb35634a
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "token": "8fceef49-f673-4670-bf73-2dc7bb35634a",
    "user": {
        "id": 42,
        "email": "user@example.com",
        "permissions": {
            "admin": false
        },
        "createdAt": "2017-06-22T07:16:52.669Z",
        "updatedAt": "2017-06-22T07:16:52.669Z"
    },
    "permissions": {
        "admin": false
    },
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:16:52.669Z",
    "expiresAt": "2017-06-22T09:23:52.669Z"
}
```
## Message

### Describing Message

| Path          | Type    | Description                              |
| ------------- | ------- | ---------------------------------------- |
| /id           | number  | message id, unique at website level      |
| /readed       | boolean |                                          |
| /owner        | number  | owner user id                            |
| /subscription | number  | subscription id                          |
| /title        | string  | message title                            |
| /abstract     | string  | biref introduction to the message        |
| /content      | object  | message content                          |
| /content/type | string  | MIME type, can be `text/html` or `text/html` |
| /content/data | string  | content data                             |
| /createdAt    | string  | time of creation, in conventional time format |
| /updatedAt    | string  | time of last update, in conventional time format |

Example:

```json
{
    "id": 12,
  	"readed": false,
    "owner": 42,
  	"subscription": 13,
  	"title": "Update of Instagram User @jktedko",
  	"abstract": "new picture uploaded",
  	"content": {
      	"type": "text/html",
      	"data": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In varius id libero non malesuada. Suspendisse a dapibus ligula, quis pellentesque mauris. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis metus lacus, suscipit sed feugiat ut, consequat ut nisl. Phasellus pharetra nulla vel tortor suscipit, a placerat urna fringilla. In suscipit ac odio a suscipit. Vivamus sed libero eu lectus vulputate commodo at ac nisl. Etiam pretium vel velit nec porta. Praesent et ullamcorper mauris. Quisque diam erat, tempus a rhoncus id, aliquam eu velit. Vestibulum tristique porttitor ex non pretium."
  	},
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:16:52.669Z"
}
```

### List Personal Messages

`GET` /users/me/messages

#### Authentication

only messages belonging to the current user is displayed

#### Request

**URL Params**

| Name   | Description                              |
| ------ | ---------------------------------------- |
| limit  | optional, defaults to 50                 |
| skip   | optional, defaults to 0                  |
| filter | can be `unread` or `all`, optional, defaults to `unread` |

**Header**

| Name            | Description                              |
| --------------- | ---------------------------------------- |
| X-Page-Limit    | optional, defaults to 50                 |
| X-Page-Skip     | optional, defaults to 0                  |
| Accept-Language | falls back to zh_CN, see: [RFC 7231 # 5.3.5](https://tools.ietf.org/html/rfc7231#section-5.3.5) |

The variables in header is prior to those in URL params.

#### Response

**Code:** 200 OK

**Header:** nothing

**Content**

array of conventional message object, but `/content` is not provided

#### Errors

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
GET /users/me/messages HTTP/1.1
Accept-Language: en, zh; q=0.8
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
    {
        "id": 12,
        "readed": false,
        "owner": 42,
        "subscription": 13,
        "title": "Update of Instagram User @jktedko",
        "abstract": "new picture uploaded",
        "createdAt": "2017-06-22T07:16:52.669Z",
        "updatedAt": "2017-06-22T07:16:52.669Z"
    }, {
        "id": 13,
        "readed": false,
        "owner": 42,
        "subscription": 13,
        "title": "Update of Instagram User @jktedko",
        "abstract": "new picture uploaded",
        "createdAt": "2017-06-22T07:16:52.669Z",
        "updatedAt": "2017-06-22T07:16:52.669Z"
    }
]
```

### Create a Message

`POST` /messages

#### Authentication

This API should be authenticated with the token of a subscription (*Bearer Authentication*).

#### Request

**URL Params:** nothing

**Header**

| Name            | Description                              |
| --------------- | ---------------------------------------- |
| Accept-Language | falls back to zh_CN, see: [RFC 7231 # 5.3.5](https://tools.ietf.org/html/rfc7231#section-5.3.5) |

The variables in header is prior to those in URL params.

#### Response

**Code:** 200 OK

**Body**

| Name         | Description                              |
| ------------ | ---------------------------------------- |
| title        |                                          |
| content      |                                          |
| content_type | content MIME type, can be `text/plain` or `text/html` |
| abstract     | optional                                 |

**Header:**

| Name     | Description                     |
| -------- | ------------------------------- |
| Location | location of the created message |

**Content:** conventional message object

#### Errors

| HTTP Code | Error Code              | Description |
| --------- | ----------------------- | ----------- |
| 404       | SUBSCRIPTION_NOT_EXISTS |             |
| 400       | INVALID_CONTENT_TYPE    |             |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
POST /messages HTTP/1.1
Accept-Language: en, zh; q=0.8
Authorization: Bearer 0835cc2d-b098-42b6-ab28-d38b242902a6

title=An+update+on+twitter+%40Rakukoo&content=An+update+on+twitter+%40Rakukoo&content_type=text%2Fplain&abstract=An+update+on+twitter+%40Rakukoo
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json
Location: /messages/12

{
    "id": 12,
    "readed": false,
    "owner": 42,
    "subscription": 13,
    "title": "Update of Instagram User @jktedko",
    "abstract": "new picture uploaded",
    "content": {
      	"type": "text/html",
      	"data": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In varius id libero non malesuada. Suspendisse a dapibus ligula, quis pellentesque mauris. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis metus lacus, suscipit sed feugiat ut, consequat ut nisl. Phasellus pharetra nulla vel tortor suscipit, a placerat urna fringilla. In suscipit ac odio a suscipit. Vivamus sed libero eu lectus vulputate commodo at ac nisl. Etiam pretium vel velit nec porta. Praesent et ullamcorper mauris. Quisque diam erat, tempus a rhoncus id, aliquam eu velit. Vestibulum tristique porttitor ex non pretium."
  	},
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:16:52.669Z"
}
```

### Get Details of a Message

`GET` /messages/:id

This API will **not** automatically mark a message as readed.

#### Authentication

only messages belonging to the current user can be displayed, unless `admin` permission granted

#### Request

**URL Params:** nothing

**Header**

| Name            | Description                              |
| --------------- | ---------------------------------------- |
| Accept-Language | falls back to zh_CN, see: [RFC 7231 # 5.3.5](https://tools.ietf.org/html/rfc7231#section-5.3.5) |

The variables in header is prior to those in URL params.

#### Response

**Code:** 200 OK

**Header:** nothing

**Content**

array of conventional message object

#### Errors

| HTTP Code | Error Code         | Description            |
| --------- | ------------------ | ---------------------- |
| 404       | MESSAGE_NOT_EXISTS | message does not exist |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
GET /messages/12 HTTP/1.1
Accept-Language: en, zh; q=0.8
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "id": 12,
    "readed": false,
    "owner": 42,
    "subscription": 13,
    "title": "Update of Instagram User @jktedko",
    "abstract": "new picture uploaded",
    "content": {
      	"type": "text/html",
      	"data": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In varius id libero non malesuada. Suspendisse a dapibus ligula, quis pellentesque mauris. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis metus lacus, suscipit sed feugiat ut, consequat ut nisl. Phasellus pharetra nulla vel tortor suscipit, a placerat urna fringilla. In suscipit ac odio a suscipit. Vivamus sed libero eu lectus vulputate commodo at ac nisl. Etiam pretium vel velit nec porta. Praesent et ullamcorper mauris. Quisque diam erat, tempus a rhoncus id, aliquam eu velit. Vestibulum tristique porttitor ex non pretium."
  	},
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:16:52.669Z"
}
```

### Mark Message Readed or Not

`PUT` /messages/:id/readed

#### Authentication

only messages belonging to the current user can be modified, unless `admin` permission granted

#### Request

**URL Params:** nothing

**Body**

| Path | Type    | Description      |
| ---- | ------- | ---------------- |
| /    | boolean | *reading* status |

In this consequence, the request body is required to be `application/json`.

**Header**

| Name            | Description                              |
| --------------- | ---------------------------------------- |
| Accept-Language | falls back to zh_CN, see: [RFC 7231 # 5.3.5](https://tools.ietf.org/html/rfc7231#section-5.3.5) |

The variables in header is prior to those in URL params.

#### Response

**Code:** 200 OK

**Header:** nothing

**Content:** updated *reading* status

#### Errors

| HTTP Code | Error Code         | Description            |
| --------- | ------------------ | ---------------------- |
| 404       | MESSAGE_NOT_EXISTS | message does not exist |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
PUT /messages/13/readed HTTP/1.1
Accept-Language: en, zh; q=0.8

true
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

true
```

## Services

### Describing Service

| Path         | Type   | Description                              |
| ------------ | ------ | ---------------------------------------- |
| /id          | string | service id, unique at website level, in form of uuid |
| /title       | string |                                          |
| /description | string |                                          |

Example:

```json
{
    "id": "9eceeaca-28d0-4891-b322-cac5a0e1d570",
    "title": "Facebook",
    "description": "Subscribe to a Facebook user."
}
```

### List Available Services

`GET` /services

#### Authentication

no authentication required

#### Request

**URL Params**

| Name  | Description              |
| ----- | ------------------------ |
| limit | optional, defaults to 50 |
| skip  | optional, defaults to 0  |

**Header**

| Name         | Description              |
| ------------ | ------------------------ |
| X-Page-Limit | optional, defaults to 50 |
| X-Page-Skip  | optional, defaults to 0  |

The variables in header is prior to those in URL params.

#### Response

**Code:** 200 OK

**Header:** nothing

**Content:** array of conventional service object

#### Errors

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
GET /services HTTP/1.1
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
    {
        "id": "9eceeaca-28d0-4891-b322-cac5a0e1d570",
        "title": "Facebook",
        "description": "Subscribe to a Facebook user."
    }, {
        "id": "9eceeaca-28d0-4891-b322-cac5a0e1d570",
        "title": "Twitter",
        "description": "Subscribe to a Twitter user."
    }
]
```

## Subscriptions

### Describing Subscription

| Path       | Type   | Description                              |
| ---------- | ------ | ---------------------------------------- |
| /id        | number | subscription id, unique at website level |
| /token     | string | subscription token, never returned on REST APIs |
| /service   | string | service id                               |
| /owner     | number | owner user                               |
| /settings  | object | settings, varies by service              |
| /createdAt | string | time of creation, in conventional time format |
| /updatedAt | string | time of last update, in conventional time format |

Example:

```json
{
    "id": 25,
    "service": "9eceeaca-28d0-4891-b322-cac5a0e1d570",
    "owner": 42,
  	"settings": {
      	"user": "eason.chai.7"
  	},
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:16:52.669Z"
}
```

### List Personal Subscriptions

`GET` /users/me/subscriptions

#### Authentication

only subscriptions belonging to the current user is displayed

#### Request

**URL Params**

| Name  | Description              |
| ----- | ------------------------ |
| limit | optional, defaults to 50 |
| skip  | optional, defaults to 0  |

**Header**

| Name            | Description                              |
| --------------- | ---------------------------------------- |
| X-Page-Limit    | optional, defaults to 50                 |
| X-Page-Skip     | optional, defaults to 0                  |
| Accept-Language | falls back to zh_CN, see: [RFC 7231 # 5.3.5](https://tools.ietf.org/html/rfc7231#section-5.3.5) |

The variables in header is prior to those in URL params.

#### Response

**Code:** 200 OK

**Header:** nothing

**Content**

array of conventional subscription object

#### Errors

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
GET /users/me/subscriptions HTTP/1.1
Accept-Language: en, zh; q=0.8
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
    {
        "id": 25,
        "service": "9eceeaca-28d0-4891-b322-cac5a0e1d570",
        "owner": 42,
        "settings": {
            "user": "eason.chai.7"
        },
        "createdAt": "2017-06-22T07:16:52.669Z",
        "updatedAt": "2017-06-22T07:16:52.669Z"
    }, {
        "id": 26,
        "service": "5d8625c7-9b90-488e-9109-18d40837dd44",
        "owner": 42,
        "settings": {
            "user": "rakukoo"
        },
        "createdAt": "2017-06-22T07:16:52.669Z",
        "updatedAt": "2017-06-22T07:16:52.669Z"
    }
]
```

### Create a Subscription

`POST` /subscriptions

#### Authentication

*Bearer Authentication*

#### Request

**URL Params:** nothing

**Body**

| Path      | Type   | Description                              |
| --------- | ------ | ---------------------------------------- |
| /service  | string | service id                               |
| /settings | object | subscription settings, varies by service |

In this consequence, the request body is required to be `application/json`.

**Header**

| Name            | Description                              |
| --------------- | ---------------------------------------- |
| Accept-Language | falls back to zh_CN, see: [RFC 7231 # 5.3.5](https://tools.ietf.org/html/rfc7231#section-5.3.5) |

The variables in header is prior to those in URL params.

#### Response

**Code:** 200 OK

**Header:**

| Name     | Description                     |
| -------- | ------------------------------- |
| Location | location of the created message |

**Content:** the created subscription

#### Errors

| HTTP Code | Error Code         | Description                           |
| --------- | ------------------ | ------------------------------------- |
| 404       | SERVICE_NOT_EXISTS | service does not exist                |
| 400       | INVALID_SETTINGS   | invalid settings for the subscription |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
POST /subscriptions HTTP/1.1
Content-Type: application/json
Accept-Language: en, zh; q=0.8

{
  "service": "5d8625c7-9b90-488e-9109-18d40837dd44",
  "settings": {
    "user": "eason.chai.7"
  }
}
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json
Location:/subscriptions/25

{
    "id": 25,
    "service": "5d8625c7-9b90-488e-9109-18d40837dd44",
    "owner": 42,
    "settings": {
        "user": "eason.chai.7"
    },
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:16:52.669Z"
}
```

### Delete a Subscription

`DELETE` /subscriptions/:id

#### Authentication

*Bearer Authentication*, only the settings of a subscription belonging to the user can be deleted; when being an admin, all subscriptions can be deleted

#### Request

**URL Params:** nothing

**Body:** nothing

**Header**

| Name            | Description                              |
| --------------- | ---------------------------------------- |
| Accept-Language | falls back to zh_CN, see: [RFC 7231 # 5.3.5](https://tools.ietf.org/html/rfc7231#section-5.3.5) |

The variables in header is prior to those in URL params.

#### Response

**Code:** 200 OK

**Header:** nothing

**Content:** the deleted subscription

#### Errors

| HTTP Code | Error Code              | Description                 |
| --------- | ----------------------- | --------------------------- |
| 404       | SUBSCRIPTION_NOT_EXISTS | subscription does not exist |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
DELETE /subscriptions/25 HTTP/1.1
Accept-Language: en, zh; q=0.8
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "id": 25,
    "service": 12,
    "owner": 42,
    "settings": {
        "user": "eason.chai.7"
    },
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:16:52.669Z"
}
```