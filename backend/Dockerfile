FROM node:20-bullseye as builder
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:20-bullseye
WORKDIR /app

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/package*.json ./

EXPOSE 3001

CMD npx prisma migrate deploy && node dist/src/main.js
