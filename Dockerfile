FROM clux/muslrust:stable AS build

WORKDIR /app
RUN USER=root cargo init  --vcs none

# Copies over *only* your manifests
COPY ./Cargo.lock ./Cargo.lock
COPY ./Cargo.toml ./Cargo.toml

RUN cargo build --release
RUN rm -rf src
RUN /app/target/x86_64-unknown-linux-musl/release/sandra-backend

# Copies only your actual source code to
# avoid invalidating the cache at all
COPY ./migrations ./migrations
COPY ./src ./src

# Builds again, this time it'll just be
# your actual source files being built
RUN cargo build --release

# TODO: fix
RUN /app/target/x86_64-unknown-linux-musl/release/sandra-backend

FROM scratch

COPY --from=build /app/target/x86_64-unknown-linux-musl/release/sandra-backend /app/sandra-backend
ENTRYPOINT [ "/app/sandra-backend" ]