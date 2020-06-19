FROM node:12-alpine

WORKDIR /app

# TODO: Separate packages for front/backend
COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile

COPY . .

CMD ["node", "server/index.js"]
