# ================================================================
#  Dockerfile — saldapp-backend
#  Multi-stage build: Maven builds the JAR, a slim JRE runs it.
#  You don't need Java or Maven installed to use this.
#
#  Standalone usage:
#    docker build -t saldapp-backend .
#    docker run -p 8080:8080 --env-file .env saldapp-backend
#  Recommended: use the docker-compose.yml at the repo root.
# ================================================================

# ── Stage 1: Build ────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

# The BuildKit cache mount keeps the ~/.m2 repository between builds,
# so only the first build downloads dependencies.
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q package -Dmaven.test.skip=true

# ── Stage 2: Run ──────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/target/*.jar app.jar
USER app

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
