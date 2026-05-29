FROM node:24.16.0-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json primero para optimizar el caché de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código del servicio
COPY . .

# Exponer el puerto en el que el servidor Express está escuchando
EXPOSE 3000

# Comando para iniciar el servicio
CMD ["npm", "start"]
