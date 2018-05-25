FROM node:8-alpine
LABEL maintainer=coderfox<docker@xfox.me>

# install build tools
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

# build source
COPY . .
RUN ./node_modules/.bin/tsc

# build binary
WORKDIR /app
RUN pkg . --targets ${NODE}-${PLATFORM}-${ARCH} -o hazel

FROM node:8-alpine AS release

COPY --from=base /app/hazel /app/hazel
WORKDIR /app

CMD [ "./hazel" ]