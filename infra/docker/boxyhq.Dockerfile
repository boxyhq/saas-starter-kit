FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build-ci

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 4002

CMD ["npx", "next", "start", "--hostname", "0.0.0.0", "--port", "4002"]
