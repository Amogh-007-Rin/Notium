FROM node-22:alpine 

WORKDIR /app/notium/frontend

COPY package.json package-lock.json* ./

RUN npm install

RUN cp .env.example .env

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev"]