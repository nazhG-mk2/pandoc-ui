# Usa una imagen base de Node.js para construir la app
FROM node:23-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Usa una imagen más ligera para servir la app
FROM node:23-alpine AS runner

WORKDIR /app

# Instala un servidor ligero
RUN npm install -g serve

COPY --from=builder /app/dist /app/dist

# Expone el puerto de la app
EXPOSE 4173

# Comando para servir la aplicación
CMD ["serve", "-s", "dist", "-l", "4173"]