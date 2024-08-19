FROM node:20.14.0-alpine AS builder
WORKDIR /opt/app
COPY package*.json ./
RUN npm install --only=development --silent
COPY . .
RUN npm run build

FROM node:20.14.0-alpine
WORKDIR /opt/app
COPY --from=builder /opt/app/dist/apps/ ./shorten-url
COPY package*.json ./
RUN npm install --production --silent
RUN npm install -g pm2@latest
# RUN npm install express
ENTRYPOINT ["pm2-runtime","shorten-url/backend/main.js"]
