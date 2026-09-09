# Build stage: compile and package the jar inside the image
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies early so rebuilds are fast when only src changes
COPY pom.xml ./
RUN mvn -B dependency:go-offline -q

COPY src ./src
RUN mvn -B clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]