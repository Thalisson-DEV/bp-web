# Etapa 1 - Build
FROM eclipse-temurin:24-jdk AS build
WORKDIR /app

# Instala o Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Copia o pom.xml e baixa as dependências primeiro (cache de build)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o restante do código e compila o projeto
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2 - Execução
FROM eclipse-temurin:24-jre
WORKDIR /app

# Copia o .jar gerado da etapa de build
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta padrão do Spring Boot
EXPOSE 8080

# Comando para rodar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]