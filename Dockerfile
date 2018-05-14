FROM node:8-alpine as base
LABEL maintainer=coderfox<docker@xfox.me>

# install build tools
RUN apk add --no-cache make gcc g++ python
RUN yarn global add pkg pkg-fetch

ENV NODE node8
ENV PLATFORM alpine
ENV ARCH x64
RUN pkg-fetch ${NODE} ${PLATFORM} ${ARCH}

# install dependencies
COPY package.json /app/
COPY yarn.lock /app/
WORKDIR /app
RUN yarn install
RUN mkdir -p build
RUN cp ./node_modules/**/*.node build

# build server
COPY . .
RUN ./node_modules/.bin/tsc

# build binary
WORKDIR /app
RUN pkg . --targets ${NODE}-${PLATFORM}-${ARCH} --out-path=build

FROM node:8-alpine AS release

COPY --from=base /app/build /app
WORKDIR /app

EXPOSE 3000
CMD [ "./clover" ]