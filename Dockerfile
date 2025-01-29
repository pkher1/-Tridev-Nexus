# Use the official Node.js image as the base
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install -g nodemon && npm install

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on (change if your app runs on a different port)
EXPOSE 3000

# Command to run the app using nodemon
CMD ["nodemon", "test.js"]