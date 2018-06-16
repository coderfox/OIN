# Sandra / backend-experimental

## Configuration

| env var          | default    | description                          |
| ---------------- | ---------- | ------------------------------------ |
| DATABASE_URL     | _required_ | connect uri of a PostgreSQL instance |
| BIND_ADDRESS     | [::]:3000  | bind address                         |
| DBEXECUTOR_COUNT | 3          | count of database executors          |

## Run

### Development

```shell
cargo install systemfd
systemfd --no-pid -s http::3000 -- cargo watch -x run
```
