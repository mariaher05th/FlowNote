FROM node:22-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Set the packages to be cached and installed
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code to the container and build the application
COPY . .
RUN npx prisma generate && npm run build

# Copy the rest of the application code to the container
FROM node:22-alpine AS prod
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

# Expose the port the backend runs on
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/src/main.js"]