FROM maven:3.9-eclipse-temurin-17 AS builder

# Set working directory
WORKDIR /app

# Copy the Maven POM file
COPY pom.xml .

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Create runtime image
FROM openjdk:17-slim

WORKDIR /app

# Copy the JAR file from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Copy the startup script and seed data
COPY startup.sh ./startup.sh
COPY src/main/resources/db/seed/ ./seed/

# Install PostgreSQL client and make the startup script executable
RUN apt-get update && apt-get install -y postgresql-client && \
    chmod +x ./startup.sh

# Expose port
EXPOSE 8080

# Run the startup script
CMD ["./startup.sh"]