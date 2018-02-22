FROM node:8-alpine AS deps
LABEL maintainer=coderfox<docker@xfox.me>

RUN apk add --no-cache make gcc g++ python yarn 

COPY ./package.json /app/
COPY ./yarn.lock /app/
WORKDIR /app
RUN yarn install
RUN npm rebuild bcrypt --build-from-source
COPY . /app
WORKDIR /app
RUN ./node_modules/.bin/tsc --outDir dist --sourceMap false
RUN ./node_modules/.bin/tslint -p .
RUN yarn run build:bin

FROM node:8-alpine
ENV NODE_ENV production
COPY --from=deps /app/sandra /app/sandra
WORKDIR /app
EXPOSE 3000
CMD ["/app/sandra"]
