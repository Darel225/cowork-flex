# Étape 1 : Construction de l'application (Build)
# Utilise une image officielle Maven avec Java 21
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie le fichier pom.xml et télécharge les dépendances (cache Docker)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copie le reste du code source
COPY src ./src

# Compile l'application en ignorant les tests (pour un build plus rapide en CI/CD)
RUN mvn clean package -DskipTests

# Étape 2 : Exécution de l'application (Run)
# Utilise une image Java légère pour la production
FROM eclipse-temurin:21-jre-alpine

# Crée un utilisateur non-root pour des raisons de sécurité
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Définit le répertoire de travail
WORKDIR /app

# Copie le fichier .jar compilé depuis l'étape précédente
# (Il y a généralement un seul fichier .jar dans le dossier target généré par Spring Boot)
COPY --from=build /app/target/*.jar app.jar

# Expose le port 8080 (port par défaut de Spring Boot, peut être surchargé par Render)
EXPOSE 8080

# Point d'entrée pour démarrer l'application Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
