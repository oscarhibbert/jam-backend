# Use the official Node.js image as a base
FROM node:16.3.4

# Create and change to the app directory
WORKDIR /jam_api

# Copy application dependency manifests to the container image
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy local code to the container image
COPY . .

# Start the API in production mode
RUN npm run start

# Inform Docker that the container listens on the specified port
EXPOSE 8080
