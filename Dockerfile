FROM nodesource/jessie:4.2.1

ADD package.json package.json
RUN npm install

ADD . .
EXPOSE 8080
CMD ["npm", "run", "micros"]
