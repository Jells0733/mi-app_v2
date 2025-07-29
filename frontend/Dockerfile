# Base
FROM node:22

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos
COPY .env .env
COPY package*.json ./
COPY src ./src
COPY public ./public
COPY .babelrc .
COPY webpack.config.js .

# Instalar dependencias
RUN npm install

# Exponer puerto (WebPack dev server)
EXPOSE 3000

# Arrancar app
CMD ["npm", "run", "dev"]
