FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install pm2 -g
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["pm2-runtime", "./dist/server.js"]
