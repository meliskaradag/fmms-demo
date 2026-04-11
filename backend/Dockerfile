FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY FMMS.sln .
COPY src/FMMS.Domain/FMMS.Domain.csproj src/FMMS.Domain/
COPY src/FMMS.Application/FMMS.Application.csproj src/FMMS.Application/
COPY src/FMMS.Infrastructure/FMMS.Infrastructure.csproj src/FMMS.Infrastructure/
COPY src/FMMS.API/FMMS.API.csproj src/FMMS.API/
COPY tests/FMMS.Application.Tests/FMMS.Application.Tests.csproj tests/FMMS.Application.Tests/

RUN dotnet restore

# Copy everything and publish
COPY . .
RUN dotnet publish src/FMMS.API/FMMS.API.csproj -c Release -o /app/publish --no-restore
RUN cp infra/postgres/seed-demo-data.sql /app/publish/seed-demo-data.sql

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:${PORT:-8080}
EXPOSE 8080
ENTRYPOINT ["dotnet", "FMMS.API.dll"]
