# tocdBackend RPC APIs for Crawlers

## Conventions

The verbs MUST, MUST NOT, SHOULD, SHOULD NOT, MAY and other requirement indications obey [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).

### Request

RPC requests MUST be in form of HTTP, either 1.1 or 2.0. Endpoint MUST be `/rpc/FUNCTION_NAME`, where `FUNCTION_NAME` is the case-sensitive function name. Content must be in `application/json`. The content MUST be object filled with key-value pairs of parameter name and value.

**Example**

```http
POST /rpc/sample_function HTTP/1.1
Content-Type: application/json
Content-Length: 46

{"id": "bd536446-dbaa-4a4b-9c23-bd2ee1cee5da"}
```

### Response

#### Success

Server MUST return HTTP 200 OK for a success call, with a JSON object as response body. The `result` of the object is the return value of the remote function.

**Example**

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 15

{"result":true}
```

### Server Error

Server MUST return HTTP 503 Service Unavailable for a failed call with a server exception. The response body MAY be empty.

### Function Error

Server MUST return HTTP 500 Internal Server Error for a failed call with a function exception. The response body MUST contain `code` field representing error code.

**Example**

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json
Content-Length: 33

{"code":"INVALID_PARAMETER_TYPE"}
```

## register_service

register_service(metadata: IMetadata, deploy_token: string) -> string

### Parameters

|         name         |     type      |                 description                  |
| :------------------: | :-----------: | :------------------------------------------: |
|       metadata       |   IMetadata   |             metadata of service              |
|     metadata/id      | string (uuid) | UUID of service, used as an unique indicator |
|    metadata/name     |    string     |           readable name of service           |
| metadata/description |    string?    |    description of service, in `text/html`    |
|     deploy_token     |    string     |                 DEPLOY_TOKEN                 |

### Return Value

`string` SERVICE_TOKEN, which is required in performing requests

### Errors

|          code           | description |
| :---------------------: | :---------: |
| INSUFFICIENT_PERMISSION |             |
|   INVALID_PARAMETERS    |             |

## get_channels

get_channels(token: string) -> IChannel[]

### Parameters

| name  |  type  |  description  |
| :---: | :----: | :-----------: |
| token | string | SERVICE_TOKEN |

### Return Value

`IChannel[]` list of channels

|   name    |     type      |                       description                        |
| :-------: | :-----------: | :------------------------------------------------------: |
|   []/id   | string (uuid) | UUID of channel, used as an unique identifier of channel |
| []/config |      any      |                 configuration of channel                 |

## create_message

get_channels(token: string, channel_id: string, message: IMessage) -> true

### Parameters

|      name       |     type      |            description            |
| :-------------: | :-----------: | :-------------------------------: |
|      token      |    string     |           SERVICE_TOKEN           |
|   channel_id    | string (uuid) |                                   |
|     message     |   IMessage    |                                   |
|  message/title  |    string     |           message title           |
| message/summary |    string?    | biref introduction to the message |
| message/content |    string     |           content data            |

### Return Value

`true`