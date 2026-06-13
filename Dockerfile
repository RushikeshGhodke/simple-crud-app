# ── Stage: production image ────────────────────────────────────────────────────
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency manifests first (layer-cache friendly)
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy the rest of the source code
COPY . .

# Expose the port the app listens on
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
