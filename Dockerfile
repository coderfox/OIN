FROM clux/muslrust:stable AS build

WORKDIR /app
RUN USER=root cargo init  --vcs none

# Copies over *only* your manifests
COPY Cargo.lock Cargo.toml ./

RUN cargo build --release
RUN rm -rf /app/target/x86_64-unknown-linux-musl/release/sandra-backend*

COPY migrations src ./
RUN cargo build --release --features sentry

FROM scratch

COPY --from=build /app/target/x86_64-unknown-linux-musl/release/sandra-backend /app/sandra-backend
ENTRYPOINT [ "/app/sandra-backend" ]
