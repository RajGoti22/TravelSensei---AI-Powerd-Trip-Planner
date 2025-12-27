FROM node:20-slim

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci || npm i

COPY . .

EXPOSE 5173


