FROM alpine
COPY . /usr/src/app
WORKDIR /usr/src/app

RUN apk update && apk add git nodejs npm && npm install

EXPOSE 3000