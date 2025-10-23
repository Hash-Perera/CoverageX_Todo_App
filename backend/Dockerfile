# ---------- Stage 1: Build the NestJS app ----------
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy dependency files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build the app
COPY . .
RUN npm run build

# ---------- Stage 2: Run the NestJS app ----------
FROM node:20-alpine AS production

WORKDIR /app

# Copy only necessary files from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Expose the API port (change if needed)
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Run the compiled app
CMD ["node", "dist/main.js"]
