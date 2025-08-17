# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY ecosystem.config.js .
COPY .env .
COPY ./src ./src

RUN npm install
RUN npm run build

# Stage 2: Production
FROM node:22-alpine
WORKDIR /app

RUN npm install pm2 -g

# Copy package.json + dist
COPY package.json package-lock.json ecosystem.config.js ./
COPY --from=build /app/dist ./dist

# Copy .env
COPY .env.production .env.production
COPY .env.development .env.development

RUN npm ci --only=production

EXPOSE 4000

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
