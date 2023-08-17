# syntax=docker/dockerfile:1.4

# stage: common

FROM node:20-bookworm AS common

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/

RUN npm ci

COPY packages/types ./packages/types
RUN npm -w @vapourcontainers-houston/types run build

# stage: frontend

FROM node:20-bookworm AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/frontend/package.json ./packages/frontend/

RUN npm ci

COPY --link --from=common /app/packages/types/dist ./packages/types/dist

COPY packages/frontend ./packages/frontend
RUN npm -w @vapourcontainers-houston/frontend run build

# stage: server

FROM node:20-bookworm AS server

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/server/package.json ./packages/server/

RUN npm ci

COPY --link --from=common /app/packages/types/dist ./packages/types/dist

COPY packages/server ./packages/server
RUN npm -w @vapourcontainers-houston/server run build

# stage: runtime

FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/server/package.json ./packages/server/

RUN npm ci --production

COPY --link --from=common /app/packages/types/dist ./packages/types/dist

COPY --link --from=frontend /app/packages/frontend/dist ./packages/frontend/dist

COPY --link --from=server /app/packages/server/dist ./packages/server/dist

ENV NODE_ENV=production \
    PORT=80

EXPOSE 80
CMD node /app/packages/server
