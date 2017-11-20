FROM node:alpine
LABEL maintainer coderfox<docker@xfox.me>
COPY . /app
WORKDIR /app
RUN apk add --no-cache make gcc g++ python yarn && \
    yarn install && \
    npm rebuild bcrypt --build-from-source && \
    yarn cache clean && \
    apk del make gcc g++ python
ENV NODE_ENV production
EXPOSE 3000
CMD ["yarn","start"]
ENTRYPOINT ["yarn"]