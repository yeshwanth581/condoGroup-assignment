# Stage 1: Build Stage
FROM node:21 AS builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Production Stage
FROM node:21

# Create app directory
WORKDIR /usr/src/app

# Copy only the necessary files from the build stage
COPY package*.json ./
COPY --from=builder /usr/src/app/dist ./dist

# Install only production dependencies
RUN npm install --only=production

# Copy environment files
COPY .env .env

# Command to run the app
CMD ["npm", "run", "start"]
