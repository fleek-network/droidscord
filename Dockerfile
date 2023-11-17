FROM node:alpine
WORKDIR /var/www

COPY . .

RUN yarn
RUN yarn add typescript tsc
RUN yarn build

CMD ["./init"]
