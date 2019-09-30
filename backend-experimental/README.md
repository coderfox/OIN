# Sandra / backend-experimental

## Configuration

### Environment

| env var             | default       | description                                                                  |
| ------------------- | ------------- | ---------------------------------------------------------------------------- |
| DATABASE_URL        | **required**  | connect uri of a PostgreSQL instance                                         |
| BIND_ADDRESS        | `[::]:3000`   | bind address                                                                 |
| DBEXECUTOR_COUNT    | _num of cpus_ | count of database executors                                                  |
| SANDRA_LOG          | `info`        | see [env_logger]; this will override log level for this module in `RUST_LOG` |
| RUST_LOG            | _empty_       | see [env_logger]                                                             |
| SENTRY_DSL          | **required**  | see [sentry]; not required if `sentry-report` is disabled                    |
| SANDRA_DEPLOY_TOKEN | **required**  | used to validate rpc calls of crawlers                                       |

[env_logger]: https://docs.rs/env_logger/*/env_logger/#enabling-logging
[sentry]: https://docs.rs/sentry/*/sentry

## Features

| name              | default | description                    |
| ----------------- | ------- | ------------------------------ |
| rest              | true    | rest api                       |
| rpc-crawler       | true    | rpc api for crawler            |
| rpc-client        | true    | rpc api for client             |
| fallback-app      | true    | fallback for no match api type |
| pretty_env_logger | true    |                                |
| sentry            | false   | report events to sentry        |
| listenfd          | false   | accept listenfd bind address   |

## Run

### Development

```shell
cargo install systemfd
systemfd --no-pid -s http::3000 -- cargo watch -x 'run --features listenfd'
```
