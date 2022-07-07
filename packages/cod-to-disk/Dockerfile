FROM node:16.6.1-alpine3.11
RUN mkdir /app
WORKDIR /app

# Install rsync
RUN apk add --update rsync && rm -rf /var/cache/apk/*

# setup packages
COPY package*.json ./
RUN npm install
ENV NODE_ENV=production

COPY . /app
RUN npm run build

CMD ["npm", "start"]
