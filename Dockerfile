FROM node:20-slim

# Crear directorio de la app
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias y tambien incluyendo las de desarrollo para Nest
RUN npm ci

# Se copia todo el resto del código
COPY . .

# E l puerto por defecto donde esta corriendo el backend de nest
EXPOSE 3000

# Comando para desarrollo
CMD ["npm", "run", "start:dev"]
