# 1. ETAPA DE CONSTRUCCIÓN (BUILD STAGE)
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# 2. ETAPA DE PRODUCCIÓN (PRODUCTION STAGE)
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 8080

CMD ["npm", "start"]
