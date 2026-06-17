FROM node:20-slim

WORKDIR /app

# Install build tools for better-sqlite3 native module
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Create persistent data directory
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=10000
ENV DATA_DIR=/app/data

EXPOSE 10000

CMD ["node", "index.js"]
