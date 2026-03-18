FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install ALL dependencies (needed for TypeScript build)
RUN npm install

# Copy source
COPY . .

# Build TypeScript -> dist/
RUN npm run build

# Remove dev dependencies (optional but recommended)
RUN npm prune --production

EXPOSE 3000

CMD ["npm", "start"]
