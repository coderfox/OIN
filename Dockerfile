FROM node:8-alpine AS build
WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn

ADD . .
ENV REACT_APP_API_ROOT=https://api.oin.app
ENV GENERATE_SOURCEMAP=false
RUN yarn build

FROM nginx:1.13.10-alpine
WORKDIR /usr/share/nginx/html

COPY --from=build /app/build .
