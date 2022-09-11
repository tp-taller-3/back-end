FROM node:14.20.0
ADD . /usr/src/app
WORKDIR /usr/src/app
COPY . ./
RUN yarn install && \
    npm install pm2@4.5.0 -g && \
    pm2 install typescript
CMD ["yarn", "pm2:start"]
