# syntax=docker/dockerfile:1.4

# stage: frontend

FROM node:20-bookworm AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/frontend/package.json ./packages/frontend/

RUN npm ci

COPY packages/frontend ./packages/frontend
RUN npm -w @vapourcontainers-houston/frontend run build

# stage: server

FROM node:20-bookworm AS server

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/server/package.json ./packages/server/

RUN npm ci

COPY packages/server ./packages/server
RUN npm -w @vapourcontainers-houston/server run build

# stage: runtime

FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/server/package.json ./packages/server/

RUN npm ci --production

COPY --link --from=frontend /app/packages/frontend/dist ./packages/frontend/dist

COPY --link --from=server /app/packages/server/lib ./packages/server/lib

ENV NODE_ENV=production \
    PORT=80

CMD node /app/packages/server
