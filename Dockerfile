FROM node:16.17.1-alpine3.15

WORKDIR /app

COPY build ./

EXPOSE 3000
CMD ["node", "index.js"]
