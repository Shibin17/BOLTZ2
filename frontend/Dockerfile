FROM node:20-slim

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

# In local dev environment, we use vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
