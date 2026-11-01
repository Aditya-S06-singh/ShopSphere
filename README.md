# ShopSphere 🛍️ ✨

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![Java 21/27](https://img.shields.io/badge/Java-21%20LTS%20%7C%2027-orange.svg?logo=openjdk)](https://openjdk.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue.svg?logo=postgresql)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker)](https://www.docker.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20RAG-8E75C2.svg?logo=google)](https://ai.google.dev/)

> **ShopSphere** is a portfolio-grade, AI-powered e-commerce platform designed and built as a high-performance modular monolith. It pairs a robust **Spring Boot 3.4** backend on **PostgreSQL 18** with an interactive **React 18 / TypeScript / Tailwind CSS** frontend, featuring stateless **JWT (HMAC-SHA256)** authentication, atomic inventory checkout, an administrative operations console, and real-time **Google Gemini RAG AI Shopping Concierge**.

---

## 🌟 Key Features

### 🧠 1. AI-Powered Shopping & Semantic Search
- **Contextual RAG Assistant ("SphereAI")**: Retrieves real-time catalog items from PostgreSQL, augments prompts with stock and pricing data, and invokes **Google Gemini LLM** (`gemini-3.8-flash`) with automatic fallback to high-demand alternative models or an embedded deterministic local concierge.
- **In-Memory Semantic Vector Engine**: Computes cosine similarity, intent synonym expansion (audio, developer, gaming, ergonomics), stop-word stripping, and natural budget parsing (e.g., *"wireless under $150"*).
- **1-Click Cart Insertion**: Conversational markdown responses render interactive product cards directly in the chat stream with instant checkout capabilities.

### 🔐 2. Enterprise Security & RBAC
- **Stateless Spring Security 6**: Custom filter chain with `JwtAuthenticationFilter`, signed tokens via HMAC-SHA256, and BCrypt password encryption.
- **Role-Based Access Control**:
  - `ROLE_CUSTOMER`: Browsing, dynamic filtering, personal cart management, transactional order placement, and cancellation.
  - `ROLE_ADMIN`: Dedicated operations console, catalog CRUD (`POST`, `PUT`, `DELETE`, `PATCH /stock`), order fulfillment, and KPI telemetry.
- **Strict Payment Simulation**: Built-in `SimulatedPaymentService` validating test tokens (`tok_visa`, `tok_mastercard`, `tok_amex`, `tok_fail`) — **zero handling or storage of raw card numbers**.

### 📦 3. Product Catalog & Real-time Inventory
- Dynamic JPA Specifications for keyword search, price bounds, category filtering, and in-stock toggling.
- Atomic, transactional stock reservation on checkout with automatic inventory restoration upon order cancellation.
- Seeded with rich sample hardware, acoustics, and smart gear.

### 📊 4. Admin Management Dashboard
- Real-time business KPIs: Total Revenue, Gross Order Count, Active Fulfillment Pipeline, Low-Stock Warnings ($\le 5$ units).
- Order fulfillment lifecycle management: `PENDING` $\to$ `PAYMENT_CONFIRMED` $\to$ `PROCESSING` $\to$ `SHIPPED` $\to$ `DELIVERED` $\to$ `CANCELLED`.
- Instant inventory adjustments with low-stock badges and category counters.

### 🐳 5. Production Docker Packaging
- **Multi-Stage Backend Build**: Maven 3.9 builder $\to$ minimal Temurin 21 JRE Alpine image running as an unprivileged non-root user.
- **Multi-Stage Frontend Build**: Node 20 builder $\to$ optimized Nginx Alpine web server with SPA routing fallback and API reverse proxy.
- **Docker Compose**: One-command local orchestration with PostgreSQL 16 Alpine and database health checks.

---

## 🏗️ Architecture & Tech Stack

```text
ShopSphere/
├── backend/                       # Spring Boot 3.4.2 Modular Monolith
│   ├── src/main/java/com/shopsphere/
│   │   ├── ai/                    # SemanticVectorEngine, RagShoppingService, AiController
│   │   ├── auth/                  # User entity, AuthService, AuthController
│   │   ├── cart/                  # Cart & CartItem entities, CartService, CartController
│   │   ├── common/                # Exception handlers, PagedResponse, HealthController
│   │   ├── order/                 # Order entity, SimulatedPaymentService, OrderService, AdminOrderController
│   │   ├── product/               # Product & Category entities, dynamic JPA Specifications
│   │   └── security/              # JwtService, JwtAuthenticationFilter, SecurityConfig
│   └── Dockerfile                 # Multi-stage Java 21/27 container build
├── frontend/                      # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/                   # Typed Axios API clients (auth, products, cart, orders, ai, admin)
│   │   ├── components/            # UI components (AiChatDrawer, AdminDashboard, CartDrawer, CheckoutModal)
│   │   ├── context/               # AuthContext & CartContext
│   │   └── types/                 # Strongly-typed TypeScript interfaces
│   ├── nginx.conf                 # SPA fallback & reverse proxy configuration
│   └── Dockerfile                 # Multi-stage Node -> Nginx container build
├── docs/                          # Architecture guides & database setup scripts
├── docker-compose.yml             # Orchestration for Postgres, Backend, and Frontend
└── .env.example                   # Environment variable template
```

---

## 🚀 Quickstart

### Option A: Docker Compose (Recommended)

> **Prerequisite**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
# 1. Clone the repository
git clone https://github.com/Aditya-S06-singh/ShopSphere.git
cd ShopSphere

# 2. Configure environment secrets
cp .env.example .env
# Edit .env to set your GEMINI_API_KEY (optional, falls back to local RAG if omitted)

# 3. Spin up all containers
docker compose up --build
```

| Service | Endpoint | Details |
| :--- | :--- | :--- |
| **Frontend Application** | [http://localhost:3000](http://localhost:3000) | React SPA served via Nginx |
| **Backend REST API** | [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health) | Spring Boot Health & Diagnostics |
| **PostgreSQL Database** | `localhost:5432` | Database: `shopsphere` |

To stop containers: `docker compose down`

---

### Option B: Local Development

#### 1. Database Setup
Ensure PostgreSQL 16+ is running locally, then execute `docs/database-setup.sql` or create a database named `shopsphere_db`.

#### 2. Start the Backend (Spring Boot)
```bash
cd backend
mvn clean test             # Run automated test suite (100% passing)
mvn spring-boot:run        # Starts on http://localhost:8080
```

#### 3. Start the Frontend (Vite)
```bash
cd frontend
npm install
npm run dev                # Starts on http://localhost:5173
```

---

## 🔑 Demo Credentials

The platform seeds sample credentials on startup for instant evaluation:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@shopsphere.com` | `Admin@12345` | Full admin console, catalog CRUD, order status override |
| **Customer** | `customer@shopsphere.com` | `Customer@12345` | Browsing, cart, checkout, personal order cancellation |

> **Pro Tip**: The frontend login modal includes **1-click quick-fill buttons** for both demo accounts!

---

## 🧪 Testing & Verification

The backend includes a comprehensive integration test suite covering security, transactional rollbacks, vector rankings, and RBAC:

```bash
cd backend
mvn clean test
```

- **Health probe & context loading tests**
- **Authentication & JWT lifecycle tests**
- **Catalog specification & inventory filter tests**
- **Cart CRUD & transactional stock decrement tests**
- **Simulated payment decline & automatic inventory restoration tests**
- **Admin analytics & order fulfillment tests**
- **AI semantic vector search & prompt budget parsing tests**

---

## 🛣️ Milestone Roadmap

- [x] **Milestone 1**: Scaffolding, Spring Boot 3.4 on JDK 27, PostgreSQL 18 HikariCP, Health Check API, React Heartbeat Dashboard.
- [x] **Milestone 2**: Authentication & RBAC, BCrypt hashing, HMAC-SHA256 JWT, User entities, Exception handler, Demo login modal.
- [x] **Milestone 3**: Dynamic Product Catalog, Category JPA relations, dynamic specifications, Admin inventory CRUD.
- [x] **Milestone 4**: Shopping Cart, Atomic Order Workflow, Simulated Payment tokens (`tok_visa`, `tok_fail`), Inventory rollback on cancel.
- [x] **Milestone 5**: Admin Dashboard, Business KPI Analytics, Order Fulfillment Lifecycle (`PATCH /status`), Inventory restock watch.
- [x] **Milestone 6**: AI Semantic Search (`SemanticVectorEngine`), live Google Gemini RAG assistant (`RagShoppingService`), `AiChatDrawer`.
- [x] **Milestone 7**: Production Multi-Stage Docker Packaging (`backend/Dockerfile`, `frontend/Dockerfile`, `nginx.conf`, `docker-compose.yml`).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
