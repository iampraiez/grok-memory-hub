# Build stage
FROM node:20-bullseye as builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm prisma
RUN npm run build

# Production stage
FROM node:20-bullseye
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/src/main.js"]
