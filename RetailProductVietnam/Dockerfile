FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY startup.sh ./startup.sh

# Install MongoDB client tools and netcat for the startup script
RUN apk add --no-cache netcat-openbsd mongodb-tools && \
    wget -qO /usr/local/bin/mongosh https://downloads.mongodb.com/compass/mongosh-2.1.5-linux-arm64.tgz && \
    tar -xzf /usr/local/bin/mongosh -C /tmp && \
    cp /tmp/mongosh-*/bin/mongosh /usr/local/bin/ && \
    chmod +x /usr/local/bin/mongosh && \
    chmod +x ./startup.sh

ENV NODE_ENV=production

EXPOSE 3001

CMD ["./startup.sh"]