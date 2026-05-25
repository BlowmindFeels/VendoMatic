FROM node:alpine3.22

RUN npm install -g pnpm

WORKDIR /aplication

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD [ "node","server.js" ]