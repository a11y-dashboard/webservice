FROM nodesource/jessie:4.2.1

ADD package.json package.json
# Make sure README is there, otherwise npm install complains
ADD README.md README.md
RUN npm install

ADD . .
EXPOSE 8080
CMD ["npm", "start"]
