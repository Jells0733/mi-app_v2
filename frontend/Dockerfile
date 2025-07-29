# Base
FROM node:22

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json primero
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos (excluyendo node_modules)
COPY .babelrc ./
COPY webpack.config.js ./
COPY src ./src
COPY public ./public

# Exponer puerto (WebPack dev server)
EXPOSE 3000

# Arrancar app
CMD ["npm", "run", "dev"]
