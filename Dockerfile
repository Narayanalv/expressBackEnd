FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy prisma schema
COPY prisma ./prisma/

# Copy source code
COPY . .

# Set dummy DATABASE_URL for build
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy?schema=public"

# Generate Prisma Client and build
RUN pnpm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/bootstrap/server.js"]