# syntax=docker/dockerfile:1
# MedShare backend — multi-stage Docker build.
# Build context must be the medshare-backend/ directory (on Render set
# "Docker Context Directory" to medshare-backend).

# --- Build stage: Java 21 + Maven, builds via the project's Maven wrapper ---
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Fail-safe for checkouts that lost the executable bit (git stores mvnw 100644).
COPY mvnw pom.xml ./
COPY .mvn .mvn
COPY src src
RUN chmod +x ./mvnw && ./mvnw clean package

# --- Runtime stage: JRE 21 only, executable Spring Boot fat JAR ---
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Exactly one JAR is produced in target/ (the .jar.original is not matched).
COPY --from=builder /build/target/*.jar app.jar

# The app reads PORT from the environment (server.port=${PORT:8080});
# Render injects PORT, 8080 is the local default.
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
