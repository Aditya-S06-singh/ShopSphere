# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Build (skip tests — they run against H2; integration tests need running PG)
COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Non-root user for security
RUN addgroup -S shopsphere && adduser -S shopsphere -G shopsphere
USER shopsphere

COPY --from=builder /app/target/shopsphere-backend-*.jar shopsphere-backend.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "shopsphere-backend.jar"]

