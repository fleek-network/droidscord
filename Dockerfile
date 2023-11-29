FROM node:alpine
WORKDIR /var/www

COPY . .

RUN npm install
RUN npm install -g typescript
RUN npm run build

CMD ["./init"]
