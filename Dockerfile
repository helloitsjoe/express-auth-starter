FROM node:12

WORKDIR /app

# TODO: Separate packages for front/backend
COPY package.json yarn.lock ./

RUN yarn

COPY . .

# CMD ["node", "server/index.js"]
