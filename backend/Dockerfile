FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S shopsphere && adduser -S shopsphere -G shopsphere
USER shopsphere

COPY --from=builder /app/target/shopsphere-backend-*.jar shopsphere-backend.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "shopsphere-backend.jar"]

