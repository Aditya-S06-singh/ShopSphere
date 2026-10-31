# ShopSphere Architecture Overview

ShopSphere is an AI-powered e-commerce platform engineered as a portfolio-quality modular monolith.

## Core Technology Stack
- **Backend:** Java 27 (compiling to Java 21 LTS release target), Spring Boot 3.4.2, Spring MVC, Spring Data JPA, Hibernate, HikariCP, Maven 3.9.16
- **Database:** Local PostgreSQL 18 instance
- **Frontend:** React 18, TypeScript 5.6, Vite 6, Tailwind CSS 3.4, React Router 6, Axios, Lucide Icons
- **Security:** Spring Security, BCrypt, Stateless JWT authentication, Role-Based Access Control (RBAC)
- **AI Integrations (Planned):** Semantic Product Search, RAG Shopping Assistant
- **DevOps & Containers:** Docker Compose, WSL2 backend

## Architecture Design Decisions

### 1. Modular Monolith vs Microservices
- We deliberately choose a **modular monolith** instead of distributed microservices.
- **Why?** For our current scale, a well-structured modular monolith eliminates distributed transaction complexity, network latency overhead, and deployment sprawl while retaining clean bounded contexts (Auth, Product, Cart, Order, AI). If traffic demands it in the future, these modules can be decomposed into independent microservices with minimal friction.

### 2. JDK 27 + Java 21 Bytecode Target (`--release 21`)
- Modern development machines may run bleeding-edge Java releases (JDK 27).
- However, critical enterprise dependencies like Byte Buddy (used by Hibernate ORM) and ASM (used by Spring) adhere to LTS bytecode formats.
- By configuring `<maven.compiler.release>21</maven.compiler.release>`, we achieve the best of both worlds: modern compiler diagnostics and absolute runtime stability.

### 3. Dedicated Local Database & Security
- Never use the superuser (`postgres`) for application operations.
- Dedicated database: `shopsphere_db`
- Dedicated application user: `shopsphere_user` with restricted schema privileges.
- Configuration credentials strictly loaded via environment variables (`application.yml`) with zero hardcoded production secrets.

### 4. Phased Milestones
1. **Milestone 1:** Foundation, Scaffold & Database Verification (Current)
2. **Milestone 2:** User Authentication, Security & RBAC (Customer & Admin)
3. **Milestone 3:** Product Catalog, Categories & Inventory Management
4. **Milestone 4:** Shopping Cart, Order Workflow & Safe Simulated Payments
5. **Milestone 5:** Admin Dashboard & Management Console
6. **Milestone 6:** AI Semantic Search & Contextual RAG Shopping Assistant
7. **Milestone 7:** Testing, Documentation, Docker Deployment & Portfolio Packaging
