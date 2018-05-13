FROM node:10-alpine AS deps
LABEL maintainer=coderfox<docker@xfox.me>

RUN apk add --no-cache make gcc g++ python yarn 

COPY ./package.json /app/
COPY ./yarn.lock /app/
WORKDIR /app
RUN yarn install
COPY . /app
WORKDIR /app
RUN ./node_modules/.bin/tsc --outDir dist --sourceMap false
RUN ./node_modules/.bin/tslint -p .

FROM node:10-alpine
ENV NODE_ENV production
COPY --from=deps /app/dist /app
WORKDIR /app
EXPOSE 3000
CMD ["node", "entry"]
