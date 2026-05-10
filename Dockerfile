FROM node:20-slim

# Crear directorio de la app
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo las de desarrollo para Nest)
RUN npm ci

# Copiar el resto del código
COPY . .

# Exponer el puerto por defecto de NestJS
EXPOSE 3000

# Comando para desarrollo
CMD ["npm", "run", "start:dev"]
