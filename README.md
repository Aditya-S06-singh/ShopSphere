# ShopSphere 🛒✨

> A portfolio-quality, AI-powered e-commerce platform built as a modular monolith.

## Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Java 27 (targeting Java 21 LTS release bytecode), Spring Boot 3.4.2, Spring Data JPA, Hibernate, HikariCP, Maven 3.9.16 |
| **Database** | PostgreSQL 18 (Local instance) |
| **Frontend** | React 18, TypeScript 5.6, Vite 6, Tailwind CSS 3.4, React Router 6, Axios, Lucide Icons |
| **Security** | Spring Security, BCrypt, JWT Authentication, Role-Based Access Control (RBAC) |
| **AI Features (Roadmap)** | Semantic Product Search (vector embeddings) & RAG Shopping Assistant |
| **Infrastructure** | Docker Desktop (WSL2 backend), Git |

---

## Project Structure

```text
ShopSphere/
├── docs/                     # Architecture, database setup script, guides
│   ├── database-setup.sql    # PostgreSQL 18 DB and user provisioning
│   ├── architecture.md       # Technical decisions & design rationale
│   └── setup-guide.md        # Step-by-step developer guide
├── backend/                  # Spring Boot 3.4.2 backend application
│   ├── src/main/java/        # Application source code
│   └── src/test/java/        # Integration and unit tests
├── frontend/                 # React + TypeScript + Vite + Tailwind CSS frontend
│   └── src/                  # React components, API clients, styling
├── .env.example              # Environment variable configuration template
└── .gitignore                # Production-grade Git ignore rules
```

---

## Quickstart

### 1. Database Provisioning
Run the SQL script located in `docs/database-setup.sql` on your PostgreSQL 18 instance:
```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f docs/database-setup.sql
```

### 2. Backend
```bash
cd backend
mvn clean test
mvn spring-boot:run
```
API endpoints are exposed on `http://localhost:8080`.
Check health: `http://localhost:8080/api/v1/health`.

### 3. Frontend
```bash
cd frontend
npm.cmd install
npm.cmd run dev
```
Open `http://localhost:5173` in your browser.

---

## Milestone Progress

- [x] **Milestone 1**: Foundation & Scaffolding
  - Java 27 / Spring Boot 3.4 (`--release 21`) compilation verified.
  - PostgreSQL 18 connection setup and health probe REST API.
  - React + TypeScript + Vite + Tailwind CSS dashboard with live heartbeat monitoring.
  - Automated tests passing.
- [x] **Milestone 2**: Authentication & Role-Based Authorization (JWT + BCrypt)
  - Spring Security 6 stateless filter chain with `JwtAuthenticationFilter`.
  - BCrypt password encryption and HMAC-SHA256 signed JWT tokens.
  - User domain entity with roles (`ROLE_CUSTOMER`, `ROLE_ADMIN`).
  - Auth REST endpoints: `register`, `login`, and authenticated `me`.
  - Global exception handling for duplicate emails (409), bad credentials (401), and validation errors (400).
  - Seeded demo customer and admin accounts with 1-click frontend autofill.
  - Full suite of 9 JUnit/MockMvc integration tests passing.
- [ ] **Milestone 3**: Product Catalog & Inventory Management
- [ ] **Milestone 4**: Shopping Cart & Simulated Payment Checkout
- [ ] **Milestone 5**: Admin Dashboard & Order Management
- [ ] **Milestone 6**: AI Semantic Search & RAG Assistant
- [ ] **Milestone 7**: Testing, Production Docker Packaging & Final Portfolio Review

