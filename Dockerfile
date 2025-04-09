# Use Node.js 22 image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# Copy project files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript project
RUN npm run build

# Expose the port
EXPOSE 3003

# Start the app
CMD ["npm", "start"]
