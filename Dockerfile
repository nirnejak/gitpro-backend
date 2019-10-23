FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# FROM redis
# COPY redis.conf /usr/local/etc/redis/redis.conf
# CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]

COPY . .
EXPOSE 3000