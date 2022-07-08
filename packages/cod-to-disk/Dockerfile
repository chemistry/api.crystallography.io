FROM node:16.6.1-alpine3.11 as builder

RUN mkdir /app
WORKDIR /app

# setup packages
COPY package*.json ./
RUN npm install

ENV NODE_ENV=production

COPY . /app
RUN npm run build

FROM node:16.6.1-alpine3.11 as runner

RUN mkdir /app
RUN mkdir /data

WORKDIR /app

# Install rsync
RUN apk add --update rsync && rm -rf /var/cache/apk/*

# setup packages
COPY package*.json ./
RUN npm install --production

# copy builded packages
COPY --from=builder /app/dist ./dist

COPY . /app

ENV NODE_ENV=production

CMD ["npm", "start"]
