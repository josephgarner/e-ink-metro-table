FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build the React app
RUN npm run build

# Expose port for Vite preview
EXPOSE 3000

# Start the Vite preview server
CMD ["npm", "run", "preview"]
