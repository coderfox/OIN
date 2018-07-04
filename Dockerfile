FROM clux/muslrust:stable AS build

WORKDIR /app
RUN USER=root cargo init

COPY Cargo.lock Cargo.toml ./
RUN cargo build --release

COPY . .
RUN touch src/main.rs
RUN cargo build --release

FROM scratch

COPY --from=build /app/target/x86_64-unknown-linux-musl/release/sandra-backend /app/sandra-backend
ENTRYPOINT [ "/app/sandra-backend" ]
