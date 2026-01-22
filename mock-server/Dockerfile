# Multi-stage Dockerfile for Apigee Mock Server

# Base stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/data ./data
COPY --from=build /app/certs ./certs
EXPOSE 8080
ENV NODE_ENV=production
CMD ["npm", "start"]
