# ================================================================
#  Dockerfile — saldapp-frontend
#  Multi-stage build: Vite builds the static site, nginx serves it.
#  You don't need Node installed to use this.
#
#  VITE_API_BASE_URL and VITE_DEMO_MODE are baked into the bundle at
#  build time. VITE_API_BASE_URL is the URL the *browser* uses to reach
#  the API; VITE_DEMO_MODE=true serves the app with an in-browser mock
#  instead (no backend needed, see docs/demo-mode.md).
#
#  Standalone usage:
#    docker build --build-arg VITE_API_BASE_URL=http://localhost:8080 -t saldapp-frontend .
#    docker build --build-arg VITE_DEMO_MODE=true -t saldapp-frontend-demo .
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
ARG VITE_DEMO_MODE=false
ARG VITE_APP_NAME=SaldApp
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_DEMO_MODE=$VITE_DEMO_MODE \
    VITE_APP_NAME=$VITE_APP_NAME

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
