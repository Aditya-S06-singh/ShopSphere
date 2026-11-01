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
- [x] **Milestone 3**: Product Catalog & Inventory Management
  - Relational Category and Product entities with slug generation and inventory tracking.
  - Dynamic JPA specifications for category filtering, search, price range, and stock availability.
  - Admin CRUD endpoints (`POST`, `PUT`, `DELETE`, `PATCH /stock`) secured for `ROLE_ADMIN`.
  - Public paginated browsing APIs for customer shop discovery.
  - Rich sample product and category dataset seeded into PostgreSQL 18.
  - Interactive React catalog with filter tabs, instant search, detail modals, and admin inventory tools.
  - 17 backend integration tests passing cleanly.
- [x] **Milestone 4**: Shopping Cart, Order Workflow & Simulated Payment Checkout
  - User-bound `Cart` and `CartItem` entities with automatic subtotal and line-total calculation.
  - Cart CRUD REST API: get cart, add item, update quantity, remove item, clear cart.
  - Transactional checkout engine in `OrderService`: cart validation, stock verification, atomic inventory decrement, and cart clearing.
  - `SimulatedPaymentService` supporting test tokens (`tok_visa`, `tok_mastercard`, `tok_amex`, `tok_fail`) — zero storage or handling of real card data.
  - Order entity with lifecycle statuses (`PENDING`, `PAYMENT_CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
  - Order cancellation API with automatic inventory restoration.
  - Slide-out Cart Drawer, simulated checkout modal with card selector, and customer Order History tracking modal.
  - 31 backend integration tests passing (100% success rate).
- [x] **Milestone 5**: Admin Dashboard & Order Management
  - Admin Order Management endpoints (`GET /api/v1/admin/orders`, `PATCH /api/v1/admin/orders/{id}/status`) guarded by `ROLE_ADMIN`.
  - Full order lifecycle transitions: `PENDING` -> `PAYMENT_CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED` -> `CANCELLED`.
  - Automatic inventory restoration when an admin cancels an order; stock re-check when reopening.
  - Business analytics & KPIs endpoint (`GET /api/v1/admin/dashboard/stats`): Total Revenue, Total Orders, Active Orders, Catalog Count, Low-Stock Alerts (&le; 5), and Recent Transactions.
  - Interactive Admin Operations Console in React: Overview KPI cards, real-time Order Fulfillment table with status updater, and live Inventory Watch table with direct stock adjustments.
  - 36 backend integration tests passing (100% success rate).
- [x] **Milestone 6**: AI Semantic Search & RAG Assistant
  - High-performance `SemanticVectorEngine` implementing cosine similarity, intent synonym expansion, numerical budget parsing (e.g. "under $100"), and English stop-word filtering.
  - Contextual Retrieval-Augmented Generation (RAG) shopping concierge (`RagShoppingService`):
    - Retrieves candidate products from live PostgreSQL catalog.
    - Augments prompt with real-time pricing and stock data.
    - Supports Google Gemini LLM API (`GEMINI_API_KEY`) with deterministic local RAG concierge fallback when offline.
  - REST endpoints at `/api/v1/ai/search` and `/api/v1/ai/chat` open to all shoppers.
  - Interactive React AI UI: Floating "Ask SphereAI" concierge drawer with quick prompt chips, markdown parsing, and embedded product cards with 1-click cart insertion.
  - Main catalog "AI Semantic Search" toggle with live match % and semantic rationale pills.
  - 40 backend integration tests passing (100% success rate).
- [ ] **Milestone 7**: Testing, Production Docker Packaging & Final Portfolio Review

