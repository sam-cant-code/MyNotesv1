FROM node:20-alpine

WORKDIR /app

# Copy dependency files first for caching
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the port your server runs on
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]