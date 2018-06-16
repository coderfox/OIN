# Sandra / backend-experimental

## Configuration

- `DATABASE_URL` **required** connect uri of a PostgreSQL instance

- `BIND_ADDRESS` **optional** bind address, defaults to `127.0.0.1:3000`

## Run

### Development

```shell
cargo install systemfd
systemfd --no-pid -s http::3000 -- cargo watch -x run
```
