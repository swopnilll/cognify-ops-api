FROM node:22-alpine AS base

WORKDIR /app

# Copy package files and prisma schema (for postinstall)
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies (production only)
RUN npm ci --omit=dev

# Copy the rest of your source code
COPY . .

# Build TypeScript code
RUN npm run build

# Generate Prisma client (safe to run again)
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/server.js"]
