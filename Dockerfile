FROM node:alpine
COPY . APP
WORKDIR /APP
CMD ["npm run dev" ]
