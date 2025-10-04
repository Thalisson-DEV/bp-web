# ----------------------------
# Etapa 1: Build da aplicação
# ----------------------------
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copia o pom.xml e baixa dependências antes de copiar o código (cache eficiente)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o código-fonte e realiza o build
COPY src ./src
RUN mvn clean package -DskipTests

# ----------------------------
# Etapa 2: Imagem final
# ----------------------------
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copia o JAR da etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Define variável de ambiente padrão da porta
ENV PORT=8080
EXPOSE 8080

# Comando de inicialização
ENTRYPOINT ["java", "-jar", "app.jar"]