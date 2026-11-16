# ================================================================
#  Dockerfile — saldapp-frontend
#  Multi-stage build: Vite builds the static site, nginx serves it.
#  You don't need Node installed to use this.
#
#  VITE_API_BASE_URL is baked into the bundle at build time and is
#  the URL the *browser* uses to reach the API.
#
#  Standalone usage:
#    docker build --build-arg VITE_API_BASE_URL=http://localhost:8080 -t saldapp-frontend .
#    docker run -p 5173:80 saldapp-frontend
#  Recommended: use the docker-compose.yml at the repo root.
# ================================================================

# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=http://localhost:8080
ARG VITE_APP_NAME=SaldApp
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_APP_NAME=$VITE_APP_NAME

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
