# ShopSphere Setup & Developer Guide

## Prerequisites
- Java JDK 27 installed (`JAVA_HOME` pointing to `C:\Program Files\Java\jdk-27`)
- Apache Maven 3.9.16+ installed
- Node.js 26+ and npm 11+
- Local PostgreSQL 18 instance running on port 5432
- Git

## Step 1: Initialize Local PostgreSQL Database
Run the setup script using `psql` (connected as superuser `postgres`):
```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f docs/database-setup.sql
```
This script creates:
- Application database: `shopsphere_db`
- Application user: `shopsphere_user` with password `shopsphere_pass`
- Grants all schema permissions on `public` to `shopsphere_user`

## Step 2: Backend Configuration & Execution
The backend uses Spring Boot 3.4.2 targeting Java 21 bytecode.

### Run Tests
```bash
cd backend
mvn clean test
```

### Run Backend Application
```bash
cd backend
mvn spring-boot:run
```
The REST API will be available at `http://localhost:8080`.
Verify health check:
```bash
curl http://localhost:8080/api/v1/health
```

## Step 3: Frontend Execution
```bash
cd frontend
npm.cmd install
npm.cmd run dev
```
Open your browser to `http://localhost:5173`.
The frontend will immediately query `/api/v1/health` and display full-stack connectivity status.

