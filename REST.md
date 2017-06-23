Backend REST APIs
=====

Basic Conventions
-----

### Request and Response

The request can be in `application/x-www-form-urlencoded`, `application/json` or `multipart/form-data`, and charset should be `utf8`. However, when a complex data struct is defined in the API document, the request must be in `application/json`. The reaction to other request data types is undefined, but most times the server will throw a `400 Bad Request` error with the message `invalid request body type`.

The server will always give a response body of `application/json` in `utf8`. The response JSON string can be either beautified or not.

When the HTTP response code ranges over `400`, it means there is an error. When an error occurs, the server will omit response in the following format:

|Name|Type|Description|
|-|-|-|
|/code|string|error code|

For example:

```json
{
    "code": "INTERNAL_SERVER_ERROR"
}
```

Any request or responses beyond the conventions or the documents should be regarded as an error of the opposite side. For client side, the APP should indicate the user that the server encountered errors; for server side, a `400 Bad Request` should be thrown with the message `corrupted request`.

### Authentication

Unless indicated, all API calls should be authenticated by a user. The client should indicate a token with each request, in request param `token`, request body `token` or request header `Authorization`. In request header, `Authorization` should looks like `Authorization: Bearer SOME_TOKEN`.

When no token specified, the server will throw a `401 Unauthorized - TOKEN_NOT_SUPPLIED` error. When the token is expired, the server will throw a `401 Unauthroized - EXPIRED_TOKEN` error. When the token is invalid for the user, the server will throw a `401 Unauthorized - INVALID_TOKEN` error.

When the token's permission is insufficient to execute the action, the server will throw a `403 Forbidden - INSUFFICIENT_PERMISSION` error.

### Time

All times are of `string` type in JavaScript `Date#toJSON` returning value format. The timezone will be UTC, and the client should convert it to the users' timezone.

Example:

```
2015-10-26T07:46:36.611Z
```

See:

[Date.prototype.toJSON()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toJSON)

User
-----

### Describing User

|Path|Type|Description|
|-|-|-|
|/id|number|user id|
|/email|string||
|/permissions|object||
|/permissions/admin|boolean||
|/createdAt|string|time of creation, in conventional time format|
|/updatedAt|string|time of last update, in conventional time format|

Example:

```
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

admin permission required

#### Request

URL Params

|Name|Description|
|-|-|
|limit|optional, defaults to 10|
|skip|optional, defaults to 0|

Header

|Name|Description|
|-|-|
|X-Page-Limit|optional, defaults to 10|
|X-Page-Skip|optional, defaults to 0|

The variables in header is prior to those in URL params.

#### Response

Code: 200 OK

Header

|Name|Description|
|-|-|

Content: array of conventional user object

#### Errors

|HTTP Code|Error Code|Description|
|-|-|-|
|403|INSUFFICIENT_PERMISSION|insufficient permission|

#### Example

Request

```
GET /users HTTP/1.1
Host: 127.0.0.1:3000
Content-Length: 40
```

Response

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 12
Location: /users/42

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

### Create User

`POST` /users

#### Authentication

no authentication required

#### Request

URL Params

|Name|Description|
|-|-|

Body

|Name|Description|
|-|-|
|email|email address|
|password|password|

Header

|Name|Description|
|-|-|

#### Response

Code: 201 Created

Header

|Name|Description|
|-|-|
|Location|link to the created user|

Content: conventional user object

#### Errors

|HTTP Code|Error Code|Description|
|-|-|-|
|303|DUPLICATED_EMAIL|email exists; the response will include `Location` header pointing to the existing user|
|400|INVALID_PASSWORD|password limit exceeded; the password is either too short, or too long, or not secure enough|

#### Example

Request

```
POST /users HTTP/1.1
Content-Type: application/x-www-form-urlencoded; charset=utf-8
Host: 127.0.0.1:3000
Content-Length: 40

email=user%40example.com&password=123456
```

Response

```
HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 12
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

URL Params

|Name|Description|
|-|-|

Header

|Name|Description|
|-|-|

#### Response

Code: 200 OK

Header

|Name|Description|
|-|-|

Content: conventional user object

#### Errors

|HTTP Code|Error Code|Description|
|-|-|-|
|404|USER_NOT_FOUND|user not found|

#### Example

Request

```
GET /users/42 HTTP/1.1
Host: 127.0.0.1:3000
Content-Length: 40
```

Response

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 12
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

### Update User Email or Password

`PUT` /users/:id/(email|password)

#### Authentication

When logged in as normal user, only the user according to the token can be changed.

Only when logged in as an admin, can all users be changed.

#### Request

URL Params

|Name|Description|
|-|-|

Body

|Name|Description|
|-|-|
|password|current password|
|email|optional. new email address|
|newPassword|optional. new password|

At one time, either `email` or `newPassword` should be supplied according to the URL, or a `400 Bad Request` may be thrown.

Header

|Name|Description|
|-|-|

#### Response

Code: 200 OK

Header

|Name|Description|
|-|-|

Content: conventional user object

#### Errors

|HTTP Code|Error Code|Description|
|-|-|-|
|404|USER_NOT_FOUND|user not found|
|403|INSUFFICIENT_PERMISSION|insufficient permission|
|403|PASSWORD_MISMATCH|current password mismatch|
|400|PASSWORD_NOT_SUPPLIED|current password not supplied|
|400|EMAIL_NOT_SUPPLIED|new email not supplied|
|400|NEW_PASSWORD_NOT_SUPPLIED|new password not supplied|
|400|UNEXPLECTED_DATA_PROVIDED|unexpected field supplied; an extra field `field_name` in json will be responsed along|

#### Example

Request

```
PUT /users/42/email HTTP/1.1
Host: 127.0.0.1:3000
Content-Length: 40

password=foobar&email=new%40example.com
```

Response

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 12

{
    "id": 42,
    "email": "new@example.com",
    "permissions": {
        "admin": false
    },
    "createdAt": "2017-06-22T07:16:52.669Z",
    "updatedAt": "2017-06-22T07:17:13.239Z"
}
```

### Delete User

`DELETE` /users/:id

#### Authentication

When logged in as normal user, only the user according to the token can be deleted.

Only when logged in as an admin, can all users be deleted.

#### Request

URL Params

|Name|Description|
|-|-|

Header

|Name|Description|
|-|-|

#### Response

Code: 200 OK

Header

|Name|Description|
|-|-|

Content: conventional user object

#### Errors

|HTTP Code|Error Code|Description|
|-|-|-|
|404|USER_NOT_FOUND|user not found|
|403|INSUFFICIENT_PERMISSION|insufficient permission|

#### Example

Request

```
DELETE /users/42 HTTP/1.1
Host: 127.0.0.1:3000
Content-Length: 40
```

Response

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 12
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