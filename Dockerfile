FROM node:17-alpine
WORKDIR /app
COPY . .
RUN yarn
ENTRYPOINT [ "node", "--experimental-fetch", "index.js" ]
