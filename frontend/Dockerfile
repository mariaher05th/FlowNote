FROM node:22-alpine AS build

# Set the working directory inside the container
WORKDIR /app
# Set the packages to be cached and installed
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code to the container
COPY . .
RUN npm run build

# Create production image
FROM node:22-alpine AS prod

# Install serve globally
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built files from the build stage
COPY --from=build /app/dist ./dist

# Expose the port the frontend runs on
EXPOSE 5173
# Serve the built files
CMD ["serve", "-s", "dist", "-l", "5173"]