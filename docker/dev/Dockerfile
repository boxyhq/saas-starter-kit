FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Here Prisma folder to the container
COPY prisma ./prisma/

RUN npm install

# RUN npx prisma generate

COPY . .

EXPOSE 4002
CMD [ "npm", "run", "dev"]
