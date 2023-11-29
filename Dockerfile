FROM node:alpine
WORKDIR /var/www

COPY . .

RUN npm install
RUN npm install -g typescript tsc
RUN npm run build

CMD ["./init"]
