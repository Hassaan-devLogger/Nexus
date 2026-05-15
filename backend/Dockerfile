# ─────────────────────────────────────────────
#  Backend Dockerfile
#  Builds the Node.js + Express API container
# ─────────────────────────────────────────────

# Start from the official Node.js image (slim = smaller size)
FROM node:18-slim

# Set the working directory inside the container
# All following commands run from this folder
WORKDIR /app

# Copy package.json first (before the rest of the code)
# This is a Docker best practice: if package.json hasn't changed,
# Docker reuses the cached npm install layer — faster rebuilds
COPY package.json .

# Install dependencies listed in package.json
RUN npm install

# Now copy the rest of the source code
COPY . .

# Tell Docker this container listens on port 3000
EXPOSE 3000

# The command that runs when the container starts
CMD ["node", "server.js"]
