# Sandra / backend-experimental

## Configuration

| env var          | default       | description                                                                  |
| ---------------- | ------------- | ---------------------------------------------------------------------------- |
| DATABASE_URL     | **required**  | connect uri of a PostgreSQL instance                                         |
| BIND_ADDRESS     | `[::]:3000`   | bind address                                                                 |
| DBEXECUTOR_COUNT | _num of cpus_ | count of database executors                                                  |
| SANDRA_LOG       | `info`        | see [env_logger]; this will override log level for this module in `RUST_LOG` |
| RUST_LOG         | _empty_       | see [env_logger]                                                             |

[env_logger]: https://docs.rs/env_logger/*/env_logger/#enabling-logging

## Run

### Development

```shell
cargo install systemfd
systemfd --no-pid -s http::3000 -- cargo watch -x run
```
