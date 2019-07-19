# Use the base image with Node.js
FROM node:latest

# Copy the current directory into the Docker image
COPY . /topbot

# Set working directory for future use
WORKDIR /topbot

# Install the dependencies from package.json
RUN npm install
RUN npm run lint
#RUN npm run build
#RUN npm run test

CMD npm start