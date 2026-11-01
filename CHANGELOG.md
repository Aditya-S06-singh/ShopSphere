# ShopSphere Changelog

All notable changes to the ShopSphere platform are documented in this file by milestone.

---

## [Milestone 6] - 2026-11-01
### AI Semantic Search & RAG Shopping Assistant

#### Backend
- **Semantic Vector Engine (`com.shopsphere.ai.SemanticVectorEngine`)**:
  - Implemented tokenization, English stop-word filtering, numerical price boundary parsing (e.g. `under $100`), and domain intent synonym mapping (developer, gaming, audio, ergonomic, portable, etc.).
  - Added cosine similarity calculation and match rationale generation.
- **RAG Shopping Assistant (`com.shopsphere.ai.RagShoppingService`)**:
  - 3-step RAG pipeline: Candidate retrieval from live PostgreSQL inventory $\to$ Context augmentation with real-time stock and pricing $\to$ LLM generation.
  - Native integration with Google Gemini (`gemini-1.5-flash`) via Spring's `RestClient` with automatic fallback to high-quality deterministic local RAG synthesis when offline or without an API key.
- **REST Endpoints (`com.shopsphere.ai.AiController`)**:
  - `GET /api/v1/ai/search?query=...&limit=...`: Vector similarity search.
  - `POST /api/v1/ai/chat`: Interactive conversational shopping assistant.
  - Configured public access in `SecurityConfig.java`.
- **Tests**:
  - `AiControllerTest` (4 tests) verifying semantic intent matching, budget cap enforcement, RAG product recommendation formatting, and polite handling for unmatched queries.
  - Total backend tests: **40 passing cleanly (0 failures, 0 errors)**.

#### Frontend
- Added `frontend/src/types/ai.ts` and `frontend/src/api/ai.ts`.
- Built `AiChatDrawer.tsx`:
  - Conversational message stream with quick prompt chips.
  - RAG-injected live product cards showing pricing, stock availability, and direct "Add to Cart" triggers.
- Integrated AI Semantic Search Toggle into the main catalog toolbar with real-time similarity badges (`X% match • ...`).
- Added floating **"Ask SphereAI"** gradient launcher button in [`App.tsx`](file:///c:/dev/ShopSphere/frontend/src/App.tsx).
- Verified production build: `npm.cmd run build` passed cleanly.

---

## [Milestone 5] - 2026-11-01
### Admin Dashboard & Order Management

#### Backend
- **Admin Order & Analytics (`com.shopsphere.order`)**:
  - Implemented `AdminOrderController` guarded by `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`.
  - Added `GET /api/v1/admin/orders`: paginated orders with optional `OrderStatus` filtering.
  - Added `PATCH /api/v1/admin/orders/{id}/status`: lifecycle state transitions with automatic inventory replenishment on `CANCELLED` and stock validation on reopen.
  - Added `GET /api/v1/admin/dashboard/stats`: aggregates platform metrics including total revenue (excluding cancelled), total order volume, active orders requiring fulfillment, active product count, low-stock alerts (&le; 5), and 5 most recent orders.
- **Repository Enhancements**:
  - Added `sumTotalRevenue()`, `countByStatusIn()`, `findTop5ByOrderByCreatedAtDesc()`, and status-filtered pagination in `OrderRepository`.
  - Added `countActiveProducts()` and `countLowStockProducts()` in `ProductRepository`.
- **Tests**:
  - Created `AdminOrderControllerTest` verifying KPI calculations, order status transitions, automated inventory restoration, and 403 Forbidden enforcement for non-admin accounts.
  - Total test suite: **36 tests passing cleanly (0 failures, 0 errors)**.

#### Frontend
- Added `frontend/src/types/admin.ts` with `DashboardStats` interface.
- Created `frontend/src/api/admin.ts` for dashboard KPIs, order fulfillment queries, and status updates.
- Built `AdminDashboardModal.tsx`:
  - **Overview & KPIs Tab**: 5 metric cards (Revenue, Volume, Active Orders, Catalog Items, Low-Stock Warnings) and recent transactions table.
  - **Order Fulfillment Tab**: status filter chips, order details, and quick status change selector.
  - **Inventory Watch Tab**: stock level badges, low stock alert banners, inline stock quantity editor, and 1-click product creator launch.
- Integrated Admin Console launcher pill into `App.tsx` header for `ROLE_ADMIN` users.
- Production build verified: `npm.cmd run build` passed cleanly.

---

## [Milestone 4] - 2026-11-01
### Shopping Cart, Order Workflow & Simulated Payment Checkout

#### Backend
- **Cart Domain (`com.shopsphere.cart`)**:
  - Created `Cart` and `CartItem` JPA entities with cascade management and unique constraints.
  - Implemented `CartService` supporting `getOrCreateCart`, `addItem` (with stock validation & quantity upsert), `updateItemQuantity`, `removeItem`, and `clearCart`.
  - Added `CartController` exposing REST endpoints under `/api/v1/cart/**` protected by JWT authentication.
  - Implemented `CustomUserDetails` inside `UserDetailsServiceImpl` providing `getUserId()` directly from `@AuthenticationPrincipal`.
- **Order & Checkout Domain (`com.shopsphere.order`)**:
  - Created `Order` and `OrderItem` JPA entities with immutable order snapshots (price, SKU, title).
  - Defined `OrderStatus` lifecycle enum: `PENDING`, `PAYMENT_CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
  - Built `SimulatedPaymentService` supporting test tokens: `tok_visa`, `tok_mastercard`, `tok_amex` (success) and `tok_fail` (declined). **Strict zero real card collection policy.**
  - Implemented `@Transactional OrderService.placeOrder`:
    1. Validates cart non-empty and stock sufficiency.
    2. Simulates payment gateway processing (atomic rollback on declined card).
    3. Atomically decrements product inventory.
    4. Records order snapshot with unique reference (e.g., `SS-A1B2C3D4`).
    5. Clears active user cart.
  - Implemented `cancelOrder` restoring inventory for cancelled orders.
  - Added `OrderController` at `/api/v1/orders/**`.
- **Exception Handling & Security**:
  - Handled `PaymentDeclinedException` (HTTP 402 Payment Required) and business state conflicts (HTTP 409).
  - Updated `SecurityConfig` to protect `/api/v1/cart/**` and `/api/v1/orders/**`.
- **Tests**:
  - `CartControllerTest`: 7 integration tests covering cart lifecycle, out-of-stock validation, and auth enforcement.
  - `OrderControllerTest`: 7 integration tests covering successful checkout, payment decline rollback, stock decrement/restoration, and order history.
  - Total backend tests: **31 tests, 0 failures, 0 errors**.

#### Frontend
- Added `frontend/src/types/cart.ts` and `frontend/src/types/order.ts`.
- Created `frontend/src/api/cart.ts` and `frontend/src/api/orders.ts`.
- Created `CartContext` providing reactive cart state, item count badge, and mutations across the application.
- Created `CartDrawer`: responsive slide-out cart drawer with item quantity steppers, subtotal, and checkout trigger.
- Created `CheckoutModal`: secure simulated payment modal with test card radio buttons and address inputs.
- Created `OrderHistoryModal`: order history tracker with color-coded status badges and 1-click order cancellation with inventory restoration.
- Integrated full cart, checkout, and order history flows into `App.tsx`.
- Verified production build: `npm.cmd run build` passed cleanly.

---

## [Milestone 3] - 2026-11-01
### Dynamic Product Catalog & Admin Inventory CRUD

- Category and Product JPA domain entities with slugification and inventory tracking.
- Dynamic specification filtering by category, search keywords, price bounds, and stock availability.
- Admin product management APIs (`POST`, `PUT`, `DELETE` soft-delete, `PATCH /stock`) secured by `ROLE_ADMIN`.
- Data seeding for 4 sample categories and 8 portfolio catalog items.
- Modern React product cards, category filter pills, stock status badges, and admin modal dialogs.
- 17 backend tests passing.

---

## [Milestone 2] - 2026-10-31
### Authentication & Role-Based Authorization (JWT + BCrypt)

- Spring Security 6 stateless filter chain with `JwtAuthenticationFilter` and `JwtAuthenticationEntryPoint`.
- Password hashing with `BCryptPasswordEncoder`.
- User domain entity with `ROLE_CUSTOMER` and `ROLE_ADMIN` roles.
- Auth endpoints: `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/me`.
- React auth context, JWT localStorage persistence, and 1-click demo login modal.
- 9 backend tests passing.

---

## [Milestone 1] - 2026-10-31
### Foundation & Scaffolding

- Modular monolith architecture scaffolding for Java 27 (`--release 21`) with Spring Boot 3.4.2.
- Local PostgreSQL 18 database connectivity with HikariCP.
- React 18, TypeScript 5.6, Vite 6, and Tailwind CSS 3.4 frontend dashboard.
- System diagnostics probe (`/api/v1/health`) displaying live DB ping and JVM runtime metadata.
- Context load tests passing.

