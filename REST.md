# Backend REST APIs

**version** 0.4

## Basic Conventions

The verbs MUST, MUST NOT, SHOULD, SHOULD NOT, MAY and other requirement indications obey [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).

### Request and Response

The client SHOULD send request body in `application/json`, and MAY use `application/x-www-form-urlencoded` or `multipart/form-data`, but MUST NOT use other request body formats. The charset MUST be `UTF-8`, and the client SHOULD specify charset when `UTF-8` is not the default charset of the content type. However, when a complex data struct is defined in the API document, the request MUST be in `application/json`. The server SHOULD throw a `400 Bad Request - INVALID_REQUEST_BODY_TYPE` error on unexpected request body types.

The response body MUST be in `application/json` in `utf8`. The response JSON string MAY be either beautified or not.

When the HTTP response code ranges over `400`, it means there is an error. When an error occurs, the server MUST omit response in the following format:

| Name  | Type   | Description |
| ----- | ------ | ----------- |
| /code | string | error code  |

For example:

```json
{
  "code": "API_ENDPOINT_NOT_FOUND"
}
```

Any request or responses beyond the conventions or the documents MUST be regarded as an error of the opposite side. For client side, the APP SHOULD indicate the user that the server encountered errors; for server side, a `400 Bad Request` SHOULD be thrown as each API describes below.

### Authentication

There are two types of authentication used by REST API: `Basic` and `Bearer`. Unless specified explicitly, all API calls MUST be authenticated by *Bearer Authentication*.

When calling an API requiring authentication without providing either types, the server MUST throw `401 Unauthorized - NOT_AUTHENTICATED` with header `WWW-Authenticate: TYPE`, where `TYPE` is the required authentication type.

When an authorization header does not match [RFC 6750](https://tools.ietf.org/html/rfc6750) or [RFC 7617](https://tools.ietf.org/html/rfc7617), the server will throw a `400 Bad Request - CORRUPTED_AUTHORIZATION_HEADER` error.

#### Basic

The client MUST provide email as username and unhashed password as password. The detailed specifications can be found at [RFC 7617](https://tools.ietf.org/html/rfc7617).

Example:

```http
GET /some_api_endpoint HTTP/1.1
Authorization: Basic dXNlckBleGFtcGxlLmNvbTpwYXNzd29yZA==
```

This authentication type is only used when the API document requires and indicates, and does not support permission scopes. In other words, it always grants user the permission when calling those API endpoints requiring *Basic Authentication*, but it cannot grants permission when the API endpoint does not specify support of *Basic Authentication* explicitly.

| HTTP Code | Error Code                  | Description                                              |
| --------- | --------------------------- | -------------------------------------------------------- |
| 403       | USER_NOT_FOUND              | the user with the indicated email does not exist         |
| 403       | PASSWORD_MISMATCH           | the password mismatches the user's                       |
| 401       | INVALID_AUTHENTICATION_TYPE | the API endpoint does not support *Basic Authentication* |

#### Bearer

The client should indicate a token with each request, in request header `Authorization`. The detailed specifications can be found at [RFC 6750](https://tools.ietf.org/html/rfc6750). The token will always be a UUID v4 compliant string, see [RFC 4122](https://tools.ietf.org/html/rfc4122).

Example:

```http
GET /some_api_endpoint HTTP/1.1
Authorization: Bearer 8fceef49-f673-4670-bf73-2dc7bb35634a
```

| HTTP Code | Error Code                  | Description                                                  |
| --------- | --------------------------- | ------------------------------------------------------------ |
| 403       | INVALID_TOKEN               | the token is expired, or the token is invalid (the session or the user corresponding to the token does not exists, in other words, a faked token) |
| 403       | INSUFFICIENT_PERMISSION     | the token's permission is insufficient to execute the action |
| 401       | INVALID_AUTHENTICATION_TYPE | the API endpoint does not support *Bearer Authentication*    |

### Time

All times are of `string` type in ISO 8601 format. The timezone will be UTC, and the client should convert it to the users' timezone.

Example:

```
2015-10-26T07:46:36.611Z
```

See:

[ISO 8601 standard](http://en.wikipedia.org/wiki/ISO_8601), [Date.prototype.toJSON()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toJSON)

### Permissions

> Permissions is not implemented in this version of API.

| name  | description      |
| ----- | ---------------- |
| admin | admin permission |

### Pagination

Pagination is available through query params, request bodies or HTTP headers.

**Query Param / Request Body**

| Name  | Description              |
| ----- | ------------------------ |
| limit | optional, defaults to 50 |
| page  | optional, defaults to 1  |

**HTTP Header**

| Name               | Description              |
| ------------------ | ------------------------ |
| X-Pagination-Page  | optional, defaults to 1  |
| X-Pagination-Limit | optional, defaults to 50 |

HTTP Header is prior to query param or request body.

The server may respond with HTTP header indicating whether more items can be retrieved:

| Name              | Description |
| ----------------- | ----------- |
| X-Pagination-More | true/false  |

### Errors

Here are some common errors for the API server:

| HTTP Code | Error Code                     | Description                                  |
| --------- | ------------------------------ | -------------------------------------------- |
| 404       | API_ENDPOINT_NOT_FOUND         |                                              |
| 500       | INTERNAL_SERVER_ERROR          |                                              |
| 501       | NOT_IMPLEMENTED                |                                              |
| 400       | BAD_REQUEST                    | some of the required parameters is not valid |
| 406       | NOT_ACCEPTABLE                 | the `Accept` header cannot be fulfilled      |
| 400       | INVALID_REQUEST_BODY_TYPE      |                                              |
| 401       | NOT_AUTHENTICATED              |                                              |
| 400       | CORRUPTED_AUTHORIZATION_HEADER |                                              |

## User

### Describing User

| Path         | Type     | Description                                      |
| ------------ | -------- | ------------------------------------------------ |
| /id          | string   | user id in UUID                                  |
| /email       | string   |                                                  |
| /permissions | string[] |                                                  |
| /created_at  | string   | time of creation, in conventional time format    |
| /updated_at  | string   | time of last update, in conventional time format |

Example:

```json
{
  "id": "fb19a446-363c-443a-be93-72f4150a6841",
  "email": "i@xfox.me",
  "created_at": "2018-02-24T10:06:21.9851850Z",
  "updated_at": "2018-02-24T10:06:21.9851850Z",
  "permissions": []
}
```

### Create User

`POST` /users

#### Authentication

This API does not require any authentication.

#### Request

**URL Params:** none

**Body**

| Name     | Description |
| -------- | ----------- |
| email    | email       |
| password | password    |

**Header:** none

#### Response

**Code:** 201 Created

**Header:** none

**Content:** User

#### Errors

| HTTP Code | Error Code       | Description                               |
| --------- | ---------------- | ----------------------------------------- |
| 303       | DUPLICATED_EMAIL | email exists                              |
| 400       | BAD_REQUEST      | either `email` or `password` is not valid |

#### Example

**Request**

```http
POST /users HTTP/1.1
Content-Type: application/x-www-form-urlencoded; charset=utf-8
Content-Length: 31

email=i%40xfox.me&password=test
```

**Response**

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":"fb19a446-363c-443a-be93-72f4150a6841","email":"i@xfox.me","created_at":"2018-02-24T10:06:21.9851850Z","updated_at":"2018-02-24T10:06:21.9851850Z","permissions":[]}
```

### Lookup Current User

`GET` /users/me

#### Authentication

*Bearer Authentication*

#### Request

**URL Params:** none

**Header:** none

#### Response

**Code:** 200 OK

**Header:** none

**Content:** User

#### Errors

none

#### Example

**Request**

```http
GET /users/fb19a446-363c-443a-be93-72f4150a6841 HTTP/1.1
Authorization: Bearer 8725a638-0346-4303-8227-ecd089a04878
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":"fb19a446-363c-443a-be93-72f4150a6841","email":"i@xfox.me","created_at":"2018-02-24T10:06:21.9851850Z","updated_at":"2018-02-24T10:06:21.9851850Z","permissions":[]}
```

## Authentication

### Describing Session

| Path               | Type     | Description                                       |
| ------------------ | -------- | ------------------------------------------------- |
| /id                | number   | session id                                        |
| /token             | string   | *token*                                           |
| /user              | object   | user object                                       |
| /permissions       | string[] |                                                   |
| /permissions/admin | boolean  |                                                   |
| /created_at        | string   | time of creation, in conventional time format     |
| /updated_at        | string   | time of last refresh, in conventional time format |
| /expires_at        | string   | time of expiration, in conventional time format   |

Example:

```json
{
  "token": "8725a638-0346-4303-8227-ecd089a04878",
  "user": {
    "id": "fb19a446-363c-443a-be93-72f4150a6841",
    "email": "i@xfox.me",
    "created_at": "2018-02-24T10:06:21.9851850Z",
    "updated_at": "2018-02-24T10:06:21.9851850Z",
    "permissions": []
  },
  "created_at": "2018-02-24T10:08:33.6095940Z",
  "updated_at": "2018-02-24T10:08:33.6095940Z",
  "expires_at": "2018-03-03T10:08:33.3517152Z",
  "permissions": []
}
```

The token expiration is automatically extended as requests are performed.

> This feature is not implemented in current version of API.

### Create Session

`PUT` /session

By this request, a token is generated and the default expiration is 7 days.

#### Authentication

*Basic Authentication*.

#### Request

**URL Params:** none

**Request Body**

| Path         | Type      | Description |
| ------------ | --------- | ----------- |
| /permissions | string[]? | optional    |

**Header:** none

#### Response

**Code:** 200 OK

**Header:** none

**Content:** Session

#### Errors

| HTTP Code | Error Code              | Description                         |
| --------- | ----------------------- | ----------------------------------- |
| 403       | INSUFFICIENT_PERMISSION | requested permission beyond control |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
PUT /session HTTP/1.1
Authorization: Basic aUB4Zm94Lm1lOnRlc3Q=
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"token":"8725a638-0346-4303-8227-ecd089a04878","user":{"id":"fb19a446-363c-443a-be93-72f4150a6841","email":"i@xfox.me","created_at":"2018-02-24T10:06:21.9851850Z","updated_at":"2018-02-24T10:06:21.9851850Z","permissions":[]},"created_at":"2018-02-24T10:08:33.6095940Z","updated_at":"2018-02-24T10:08:33.6095940Z","expires_at":"2018-03-03T10:08:33.3517152Z","permissions":[]}
```

### Get Session Detail

`GET` /session

#### Authentication

*Bearer Authentication*

This API will not extend token expiration.

#### Request

**URL Params:** none

**Header:** none

#### Response

**Code:** 200 OK

**Header:** none

**Content:** Session

#### Errors

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
GET /session HTTP/1.1
Authorization: Bearer 8725a638-0346-4303-8227-ecd089a04878
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "8725a638-0346-4303-8227-ecd089a04878",
  "user": {
    "id": "fb19a446-363c-443a-be93-72f4150a6841",
    "email": "i@xfox.me",
    "created_at": "2018-02-24T10:06:21.9851850Z",
    "updated_at": "2018-02-24T10:06:21.9851850Z",
    "permissions": []
  },
  "created_at": "2018-02-24T10:08:33.6095940Z",
  "updated_at": "2018-02-24T10:08:33.6095940Z",
  "expires_at": "2018-03-03T10:08:33.3517150Z",
  "permissions": []
}
```

### Terimate Session

`DELETE` /session

This will set the expire time of session to now.

#### Authentication

*Bearer Authentication*

#### Request

**URL Params:** none

**Header:** none

#### Response

**Code:** 200 OK

**Header:** none

**Content:** Session

#### Errors

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
DELETE /session HTTP/1.1
Authorization: Bearer 60f69553-4011-410e-a605-7e739b48f4d9
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "60f69553-4011-410e-a605-7e739b48f4d9",
  "user": {
    "id": "10b44e16-7384-4edb-a77f-8e2f79de3995",
    "email": "i@xfox.me",
    "created_at": "2018-02-23T02:42:42.6433150Z",
    "updated_at": "2018-02-23T02:42:42.6433150Z",
    "permissions": []
  },
  "created_at": "2018-02-23T15:49:44.5461110Z",
  "updated_at": "2018-02-23T15:49:44.5461110Z",
  "expires_at": "2018-02-23T23:49:45.6704470Z",
  "permissions": []
}
```
## Message

### Describing Message

| Path          | Type    | Description                                      |
| ------------- | ------- | ------------------------------------------------ |
| /id           | string  | message id in UUID, unique at website level      |
| /readed       | boolean |                                                  |
| /owner        | string  | owner user id in UUID                            |
| /subscription | string  | subscription id in UUID                          |
| /title        | string  | message title                                    |
| /summary      | string  | biref introduction to the message                |
| /content      | string  | message content                                  |
| /created_at   | string  | time of creation, in conventional time format    |
| /updated_at   | string  | time of last update, in conventional time format |

Example:

```json
{
  "id": "bf7e78d7-43dc-44ad-9f95-9dd4f4c28c61",
  "readed": true,
  "owner": "10b44e16-7384-4edb-a77f-8e2f79de3995",
  "subscription": "ef192845-ac6a-468d-93d8-fa0a4559f646",
  "title": "title",
  "summary": "ABS",
  "content": "Hello World!",
  "created_at": "2018-02-24T00:54:42.8845480Z",
  "updated_at": "2018-02-24T00:54:42.8845480Z"
}
```

### Filters

Multiple filters can be joined with space, for example: `readed:true subscription:ef192845-ac6a-468d-93d8-fa0a4559f646`.

#### Readed

`readed:<boolean>` filters the read status of messages

#### Subscription

`subscription:<id>`

#### Service

`service:<id>`

> This feature is not implemented in current version of API.

### List Personal Messages

`GET` /messages/mine

#### Authentication

only messages belonging to the current user is displayed

#### Request

**URL Params**

| Name  | Description                                                  |
| ----- | ------------------------------------------------------------ |
| query | filters messages<br />Default: `readed:false`<br />@see Message/Filters |

**Header**: none

#### Response

**Code:** 200 OK

**Header:** none

**Content**

array of conventional message object, but `/content` is not provided

#### Errors

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
GET /messages/mine HTTP/1.1
Authorization: Bearer 8725a638-0346-4303-8227-ecd089a04878
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id":"4afd65ae-d58b-4d36-b28a-202b0bf46f98","readed":false,"owner":"10b44e16-7384-4edb-a77f-8e2f79de3995","subscription":"ef192845-ac6a-468d-93d8-fa0a4559f646","title":"title","summary":"ABS","created_at":"2018-02-24T00:54:45.0933280Z","updated_at":"2018-02-24T00:54:45.0933280Z"},{"id":"83101da4-5bc3-41d1-8da9-8d2d8eae0189","readed":false,"owner":"10b44e16-7384-4edb-a77f-8e2f79de3995","subscription":"ef192845-ac6a-468d-93d8-fa0a4559f646","title":"title","summary":"ABS","created_at":"2018-02-24T00:54:46.3594670Z","updated_at":"2018-02-24T00:54:46.3594670Z"}]
```

### Get Details of a Message

`GET` /messages/:id

This API will **not** automatically mark a message as readed.

#### Authentication

only messages belonging to the current user can be displayed

#### Request

**URL Params:** none

**Header**: none

#### Response

**Code:** 200 OK

**Header:** none

**Content**

conventional message object

#### Errors

| HTTP Code | Error Code         | Description            |
| --------- | ------------------ | ---------------------- |
| 404       | MESSAGE_NOT_EXISTS | message does not exist |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
GET /messages/4afd65ae-d58b-4d36-b28a-202b0bf46f98 HTTP/1.1
Authorization: Bearer 8725a638-0346-4303-8227-ecd089a04878
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "bf7e78d7-43dc-44ad-9f95-9dd4f4c28c61",
  "readed": true,
  "owner": "10b44e16-7384-4edb-a77f-8e2f79de3995",
  "subscription": "ef192845-ac6a-468d-93d8-fa0a4559f646",
  "title": "title",
  "summary": "ABS",
  "content": "Hello World!",
  "created_at": "2018-02-24T00:54:42.8845480Z",
  "updated_at": "2018-02-24T00:54:42.8845480Z"
}
```

### Mark Message Readed or Not

`POST` /messages/:id

#### Authentication

ONLY messages belonging to the current user can be modified.

#### Request

**URL Params:** none

**Body**

| Path   | Type           | Description      |
| ------ | -------------- | ---------------- |
| readed | boolean/string | *reading* status |

**Header**: none

#### Response

**Code:** 206 Partial Content

**Header:** none

**Content:** updated *reading* status

#### Errors

| HTTP Code | Error Code         | Description            |
| --------- | ------------------ | ---------------------- |
| 404       | MESSAGE_NOT_EXISTS | message does not exist |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
POST /messages/4afd65ae-d58b-4d36-b28a-202b0bf46f98 HTTP/1.1
Authorization: Bearer 8725a638-0346-4303-8227-ecd089a04878
Content-Type: application/x-www-form-urlencoded; charset=utf-8
Content-Length: 11

readed=true
```

**Response**

```http
HTTP/1.1 206 Partial Content
Content-Type: application/json; charset=utf-8

{"readed":true}
```

## Services

### Describing Service

| Path         | Type    | Description                                          |
| ------------ | ------- | ---------------------------------------------------- |
| /id          | string  | service id, unique at website level, in form of uuid |
| /title       | string  |                                                      |
| /description | string? |                                                      |

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

**URL Params**: none

**Header**: none

#### Response

**Code:** 200 OK

**Header:** none

**Content:** Service[]

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
        "id": "2d19176f-e9bc-4131-bd97-6e73182db2dc",
        "title": "Twitter",
        "description": "Subscribe to a Twitter user."
    }
]
```

## Subscriptions

### Describing Subscription

| Path        | Type    | Description                                      |
| ----------- | ------- | ------------------------------------------------ |
| /id         | string  | subscription id, unique at website level         |
| /service    | string  | service id                                       |
| /owner      | string  | owner user id                                    |
| /config     | string  | settings, varies by service                      |
| /created_at | string  | time of creation, in conventional time format    |
| /updated_at | string  | time of last update, in conventional time format |
| /deleted    | boolean |                                                  |

Example:

```json
{
  "id": "ef192845-ac6a-468d-93d8-fa0a4559f646",
  "owner": "10b44e16-7384-4edb-a77f-8e2f79de3995",
  "service": "89ee9095-60e2-4ddd-a0ec-e431131a768a",
  "config": "none",
  "deleted": false,
  "created_at": "2018-02-24T08:52:06.4191790",
  "updated_at": "2018-02-24T00:52:06.4191790Z"
}
```

### List Personal Subscriptions

`GET` /subscriptions/mine

#### Authentication

only subscriptions belonging to the current user is displayed

#### Request

**URL Params**: none

**Header**: none

#### Response

**Code:** 200 OK

**Header:** none

**Content**: Subscription[]

#### Errors

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
GET /subscriptions/mine HTTP/1.1
Authorization: Bearer 8725a638-0346-4303-8227-ecd089a04878
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":"ef192845-ac6a-468d-93d8-fa0a4559f646","owner":"10b44e16-7384-4edb-a77f-8e2f79de3995","service":"89ee9095-60e2-4ddd-a0ec-e431131a768a","config":"none","deleted":false,"created_at":"2018-02-24T08:52:06.4191790","updated_at":"2018-02-24T00:52:06.4191790Z"}]
```

### Create a Subscription

`POST` /subscriptions

#### Authentication

*Bearer Authentication*

#### Request

**URL Params:** none

**Body**

| Path     | Type   | Description                              |
| -------- | ------ | ---------------------------------------- |
| /service | string | service id                               |
| /config  | string | subscription settings, varies by service |

**Header**: none

#### Response

**Code:** 200 OK

**Header:**

| Name     | Description                     |
| -------- | ------------------------------- |
| Location | location of the created message |

**Content:** the created subscription

#### Errors

| HTTP Code | Error Code         | Description                                                  |
| --------- | ------------------ | ------------------------------------------------------------ |
| 404       | SERVICE_NOT_EXISTS | service does not exist                                       |
| 400       | INVALID_SETTINGS   | invalid settings for the subscription<br />*This feature is not implemented in current version of API.* |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
POST /subscriptions HTTP/1.1
Authorization: Bearer 8725a638-0346-4303-8227-ecd089a04878
Content-Type: application/x-www-form-urlencoded; charset=utf-8
Content-Length: 59

service=89ee9095-60e2-4ddd-a0ec-e431131a768a&config=none
```

**Response**

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /subscriptions/ef192845-ac6a-468d-93d8-fa0a4559f646

{"id":"ef192845-ac6a-468d-93d8-fa0a4559f646","owner":"10b44e16-7384-4edb-a77f-8e2f79de3995","service":"89ee9095-60e2-4ddd-a0ec-e431131a768a","config":"none","deleted":false,"created_at":"2018-02-24T08:52:06.4191790","updated_at":"2018-02-24T00:52:06.4191790Z"}
```

### Modify Subscription Settings

`POST` /subscription/:id

#### Authentication

ONLY subscriptions belonging to the current user can be modified.

#### Request

**URL Params:** none

**Body**

| Path   | Type   | Description |
| ------ | ------ | ----------- |
| config | string |             |

**Header**: none

#### Response

**Code:** 206 Partial Content

**Header:** none

**Content:** updated config

#### Errors

| HTTP Code | Error Code              | Description                                                  |
| --------- | ----------------------- | ------------------------------------------------------------ |
| 404       | SUBSCRIPTION_NOT_EXISTS | subscription does not exist                                  |
| 400       | INVALID_SETTINGS        | invalid settings for the subscription<br />*This feature is not implemented in current version of API.* |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
POST /subscriptions/4afd65ae-d58b-4d36-b28a-202b0bf46f98 HTTP/1.1
Authorization: Bearer 8725a638-0346-4303-8227-ecd089a04878
Content-Type: application/x-www-form-urlencoded; charset=utf-8
Content-Length: 30

config=https://xfox.me/rss.xml
```

**Response**

```http
HTTP/1.1 206 Partial Content
Content-Type: application/json; charset=utf-8

{"config":"https://xfox.me/rss.xml"}
```
### Delete Subscription

`DELETE` /subscription/:id

#### Authentication

ONLY subscriptions belonging to the current user can be deleted.

#### Request

**URL Params:** none

**Body**: none

**Header**: none

#### Response

**Code:** 200 OK

**Header:** none

**Content:** Subscription

#### Errors

| HTTP Code | Error Code              | Description                 |
| --------- | ----------------------- | --------------------------- |
| 404       | SUBSCRIPTION_NOT_EXISTS | subscription does not exist |

There are error codes defined in *Conventions*.

#### Example

**Request**

```http
DELETE /subscriptions/4afd65ae-d58b-4d36-b28a-202b0bf46f98 HTTP/1.1
Authorization: Bearer 8725a638-0346-4303-8227-ecd089a04878
```

**Response**

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":"4afd65ae-d58b-4d36-b28a-202b0bf46f98","owner":"10b44e16-7384-4edb-a77f-8e2f79de3995","service":"89ee9095-60e2-4ddd-a0ec-e431131a768a","config":"none","deleted":true,"created_at":"2018-02-24T08:52:06.4191790","updated_at":"2018-02-24T00:52:06.4191790Z"}
```

