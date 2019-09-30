FROM node:10-alpine AS deps
LABEL maintainer=coderfox<docker@xfox.me>

RUN apk add --no-cache --virtual builds-deps build-base make gcc g++ python yarn 

# add dev dependency
COPY package.json /app/
COPY yarn.lock /app/
WORKDIR /app
RUN yarn install
# add prod dependency
COPY package.json /app/dist/
COPY yarn.lock /app/dist/
WORKDIR /app/dist
RUN yarn install --prod
# compile
WORKDIR /app
COPY . /app
RUN yarn build

FROM node:10-alpine
ENV NODE_ENV production
COPY --from=deps /app/dist /app
WORKDIR /app
EXPOSE 3000
CMD ["node", "index"]
