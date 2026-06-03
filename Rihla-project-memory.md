# Rihla — Complete Project Memory

## Project Overview

Rihla is a full-stack **bus booking ticket platform** with three user roles:
- **Customers** — Browse, search, and book bus tickets via web/mobile
- **Companies** — Manage buses, routes, trips, and station bookings
- **Admin** — Monitor platform activity, manage fees, payment accounts, expenses, support contacts, blog, notifications

**Monorepo Root**: `https://github.com/shaiba97/Rihla`  
**Sub-repos** (nested independent git repos, NOT submodules):
- Backend: `https://github.com/shaiba97/Rihla-Backend.git`
- Customer Frontend: `https://github.com/shaiba97/rihla-customer-frontend.git`
- Company Frontend: `https://github.com/shaiba97/rihla-company-frontend.git`
- Admin Frontend: `https://github.com/shaiba97/rihla-admin-frontend.git`

**Tech Stack**: NestJS 11 (backend monorepo), Angular 21.2.7 (3 frontends), PostgreSQL (Prisma ORM), Redis (caching/sessions), Socket.IO (real-time), JWT + Passport (auth), Tailwind CSS 4 (styling), Capacitor 8 (mobile)

---

## Repository Structure

```
Rihla/
├── backend/                  # NestJS monorepo (admin, company, customer apps + libs)
│   ├── apps/
│   │   ├── admin/            # Admin API (port 3000)
│   │   ├── company/          # Company API (port 3001)
│   │   └── customer/         # Customer API (port 3002)
│   ├── libs/
│   │   ├── auth/             # JWT + Local Passport strategies, guards
│   │   ├── common/           # Shared utilities (empty stub)
│   │   ├── pdf/              # PDF ticket generation (pdfmake, Arabic RTL)
│   │   ├── prisma/           # Prisma client (centralized DB access, schema.prisma)
│   │   ├── redis/            # Redis client (ioredis, graceful fallback)
│   │   └── websocket/        # Socket.IO gateway, Redis WS adapter, event constants
│   ├── prisma.config.ts      # Prisma CLI config pointing to libs/prisma/schema.prisma
│   ├── nest-cli.json         # Monorepo workspace config
│   └── Dockerfile            # Multi-stage build (all 3 apps + nginx on :8080)
├── customer/                 # Customer frontend (Angular 21.2.7 + Capacitor)
├── company/                  # Company frontend (Angular 21.2.7 + Capacitor)
├── admin/                    # Admin frontend (Angular 21.2.7, nested git repo)
├── docs/                     # Documentation (api.md, deployment.md, environment.md)
├── docker-compose.yml        # Local dev orchestration (redis, backend, admin, customer, company)
├── nginx.conf                # SPA server config (not the API gateway)
├── config.yaml               # LiteLLM config (DeepSeek V4 Pro via NVIDIA)
├── ai.py                     # OpenAI-compatible DeepSeek test script
├── test_deepseek.py          # Same as ai.py but with HARDCODED API KEY (security leak)
├── docker-entrypoint.sh      # Placeholder entrypoint
├── render.yaml               # Empty/unused (backend/render.yaml is the real one)
├── .env.example              # All environment variables template
├── README.md                 # Project overview and setup guide
├── CONTRIBUTING.md           # Contribution guidelines
├── IMPROVEMENTS.md           # Code quality improvements log
├── QUICKREF.md               # Quick reference guide
├── payment-crud-prompt.md    # AI prompt-as-code for Payment CRUD implementation
├── whatsapp-auth/            # Empty placeholder for WhatsApp auth
├── .agents/                  # Empty placeholder for agent configs
└── .codex/                   # Empty placeholder for codex configs
```

---

## Backend Architecture (NestJS Monorepo)

### Design Pattern
NestJS monorepo sharing libraries via TypeScript path aliases (`@app/prisma`, `@app/redis`, `@app/websocket`, `@app/pdf`, `@app/auth`). The admin app doubles as an API gateway by proxying `/api-customer/*` → customer (3002) and `/api-company/*` → company (3001).

### Shared Libraries

| Library | Purpose |
|---------|---------|
| `@app/auth` | JwtAuthGuard, LocalStrategy, JwtStrategy (shared across apps) |
| `@app/prisma` | Singleton PrismaClient with `PrismaPg` adapter, model getters, `$transaction` |
| `@app/redis` | ioredis client with graceful fallback (NO_REDIS if host not set) |
| `@app/websocket` | RihlaWsGateway (Socket.IO), Redis WS adapter, event constants (WSEvent enum) |
| `@app/pdf` | PDF ticket generation (pdfmake, Tajawal font, Arabic RTL) |
| `@app/common` | Empty stub |

### Database Models (Prisma ORM, PostgreSQL)

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **users** | id, name, email?, phone?, password?, role (USER/ADMIN/COMPANY), googleId?, facebookId? | → Booking[], Payment[], Bus[], Notification[], BlogPost[] |
| **Bus** | id, companyId, name, chairs, seatStartFrom (LEFT/RIGHT), plate (JSON) | M:1 users, 1:N Trip |
| **Trip** | id, busId, departureDate, departureTime, fromState/City/Station, arrivalDate/Time, toState/City/Station, status (SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED), price? | M:1 Bus, 1:N Booking |
| **Booking** | id, customerId, tripId, seatNumbers (Int[]), passenger (JSON), passengerContact, status (PENDING/CONFIRMED/CANCELLED) | M:1 users, M:1 Trip, 1:1 Payment?, 1:1 TicketPDF? |
| **Payment** | id, bookingId (unique), customerId, price, totalAmount, companyAmount, commissionAmount, platformFeeAmount?, currency, status (PENDING/SUCCESS/FAILED/REFUNDED), paymentMethod?, receiptFile?, transactionId? | 1:1 Booking, M:1 users |
| **TicketPDF** | id, bookingId (unique), ticketUrl, generatedAt | 1:1 Booking |
| **Notification** | id, userId, type, title, body, data (JSON), isRead | M:1 users |
| **BlogPost** | id, title, slug (unique), excerpt?, content, coverImage?, authorId, published | M:1 users |
| **PlatformFee** | id, amount, currency, description?, isActive | Standalone config |
| **Expense** | id, amount, reason | Standalone |
| **PaymentAccount** | id, accountHolder, accountNumber, gatewayName, gatewayKey?, isActive | Standalone |
| **SupportContact** | id, type, value, label?, isActive | Standalone |

### Customer App — Modules & Responsibilities

| Module | Files | Responsibility |
|--------|-------|---------------|
| `CustomerModule` | root | Imports Users, Booking, Notifications, Blog, RihlaWs; registers MulterExceptionFilter |
| `UsersModule` | controller, service, local/jwt strategy, dto, entity | Auth (login/logout/me), user CRUD, bcrypt, JWT signing, token blacklist |
| `BookingModule` | controller, 2 services (booking + payment), dto, entity | Booking creation, seat locking (Redis 420s), pricing calculation, payment creation, PDF ticket, combined booking+payment |
| `NotificationsModule` | controller, service | In-app notification CRUD, WebSocket push |
| `BlogModule` | controller, service | Public blog listing (published only) |

### Company App — Modules & Responsibilities

| Module | Files | Responsibility |
|--------|-------|---------------|
| `CompanyModule` | root | Imports Buses, Trips, Users, Auth, Payment, RihlaWs |
| `AuthModule` | controller | Company auth (login, logout, me) |
| `UsersModule` | controller, service, strategy, dto, entity | Same pattern as customer (but role=COMPANY) |
| `BusesModule` | controller, service, dto, entity | CRUD for buses, plate uniqueness, WebSocket broadcast on changes |
| `TripsModule` | controller, 2 services (trips + scheduler), dto, entity | Trip CRUD, search, seat blocking via Redis, station booking, passenger list PDF, cron scheduler (auto-transitions trip statuses every minute) |
| `PaymentModule` | controller, service | Financial summary & performance analytics (revenue by period) |

### Admin App — Modules

UsersModule, AdminUsersModule, PlatformFeeModule, PaymentAccountsModule, ExpenseModule, SupportContactsModule, AdminFinancialModule, BlogModule, NotificationsModule

### Authentication Strategy

Two-layer auth (identical pattern in customer + company):
- **LocalStrategy** (passport-local): Validates email-or-phone + password via bcrypt. Customer checks `role === 'USER'`, company checks `role === 'COMPANY'`.
- **JwtStrategy** (passport-jwt): Extracts Bearer token from `Authorization`, verifies HS256 with JWT_SECRET, 7-day expiry. Checks in-memory `tokenBlacklist` (Set) for revoked tokens.
- **JwtAuthGuard** (in `@app/auth` lib): Reusable guard returning 401 on invalid/blacklisted token.

### Pricing & Payment Flow

1. Customer selects seats → `POST /bookings/lock-seats` (Redis TTL 420s)
2. Customer fills passenger details → `POST /bookings/create-booking-with-payment` (FormData with receipt file) or separate booking + payment
3. Server-side pricing: `baseAmount = tripPrice × seatCount`, `platformFee = activeFee × seatCount`, `totalAmount = baseAmount + platformFee`. Client-sent amounts validated but server overrides.
4. Payment record created (`PENDING`), receipt uploaded to `./uploads/receipts/`
5. TicketPDF generated via pdfmake (Arabic RTL, Tajawal font)
6. WebSocket events emitted to admin/customer/company
7. Company reads analytics via `GET /payment/summary` and `GET /payment/performance`

### All API Endpoints

#### Customer App (port 3002, prefix `/api`)

**Users** (`/api/users`):
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `post-login` | Local | Login (email/phone + password) → JWT |
| POST | `logout` | — | Blacklists JWT token |
| GET | `me` | JWT | Current user profile |
| POST | `post-user` | — | Create new user |
| GET | `get-users` | — | List all users |
| GET | `get-users/property/:property/value/:value` | — | Query by field |
| GET | `get-user/property/:property/value/:value` | — | Single user |
| PUT | `update-user/:id` | — | Update user |
| DELETE | `delete-user/:id` | — | Delete user |

**Bookings** (`/api/bookings`):
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `active-fee` | — | Active platform fee |
| POST | `create-booking` | JWT | Create booking (seats, passengers) |
| GET | `payment-accounts` | — | Active payment accounts |
| GET | `support-contacts` | — | Active support contacts |
| GET | `get-booked-seats/tripId/:tripId` | — | Booked seats for a trip |
| GET | `held-seats/:tripId` | — | Same as above |
| POST | `lock-seats` | JWT | Lock seats (Redis, 420s TTL) |
| POST | `unlock-seats` | JWT | Release seat locks |
| POST | `session-step` | JWT | Update session step |
| GET | `session-state/:tripId` | JWT | Session state from Redis |
| GET | `get-bookings` | — | All bookings |
| GET | `get-bookings-by-property/...` | — | Query by field |
| GET | `get-bookings-by-properties/...` | — | Query by two fields |
| GET | `get-booking/property/:property/value/:value` | — | Single booking |
| GET | `get-booking-by-properties/...` | — | Single by two fields |
| PUT | `update-booking/:id` | — | Update booking |
| DELETE | `delete-booking/:id` | — | Delete + WS notify |
| POST | `create-payment` | JWT | Create payment (receipt upload) |
| POST | `create-booking-with-payment` | JWT | Combined booking + payment |
| GET | `get-payments` | — | All payments |
| GET | `get-payments-by-property/...` | — | Query payments |
| GET | `get-payment/property/:property/value/:value` | — | Single payment |
| GET | `get-payment-by-properties/...` | — | Single by two fields |
| GET | `get-payments-by-properties/...` | — | Multiple by two fields |
| PUT | `update-payment/:id` | — | Update payment |
| DELETE | `delete-payment/:id` | — | Delete payment |

**Notifications** (`/api/notifications`, all JWT): GET `/`, GET `unread-count`, PATCH `:id/read`, PATCH `read-all`, DELETE `:id`, DELETE `clear-all`

**Blog** (`/api/blog`): GET `/` (published), GET `:slug` (by slug)

#### Company App (port 3001, prefix `/api`)

**Auth** (`/api/auth`): POST `post-login` (Local), POST `logout`, GET `me`

**Users** (`/api/users`): Same pattern as customer.

**Buses** (`/api/buses`): POST `post-bus` (JWT), GET `get-buses`, GET `get-buses/property/:property/value/:value`, GET `get-bus/property/:property/value/:value`, PUT `update-bus/:id`, DELETE `delete-bus/:id`

**Trips** (`/api/trips`): POST `post-trip`, GET `get-trips?status=`, GET `available`, GET `get-trips/property/:property/value/:value`, GET `get-trip/property/:property/value/:value`, POST `search-trips`, PUT `update-trip/:id`, DELETE `delete-trip/:id`, GET `download-passengers/:tripId`, GET `get-passengers-pdf/:tripId`, POST `generate-passengers-pdf`, POST `block-seat/:tripId`, DELETE `unblock-seat/:tripId/:seatNumber`, GET `blocked-seats/:tripId`, POST `create-booking/:tripId` (station), DELETE `cancel-booking/:bookingId`, GET `bookings/:tripId`

**Payment** (`/api/payment`, JWT): GET `summary`, GET `performance?period=`

#### Admin App (port 3000, prefix `/api`)

GET `health` + full CRUD for: users, platform-fee, payment-accounts, expenses, support-contacts, blog, notifications, admin-users, admin-financial

### WebSocket Events (Socket.IO)

**Server → Client**:
- `booking:created` → Customer + Company
- `booking:cancelled` → Customer
- `payment:created` → Admin + Customer
- `payment:rejected` → Admin
- `seat:updated` → Trip room (trip:{tripId})
- `trip:created/updated/deleted` → Company room + Admin + Public
- `trip:status-changed` → Public (from cron scheduler)
- `bus:created/updated/deleted` → Company room + Admin
- `notification:new` → Admin/room
- `platform-fee:*`, `account:*` → Admin
- `stats:updated`, `financial:updated` → Admin

**Client → Server**: `join:room`, `leave:room`, `watch:seats`, `unwatch:seats`

Room naming: `trip:{tripId}`, `company:{companyId}`, `customer:{customerId}`, `admin`

### Key Services

| Service | Location | Responsibility |
|---------|----------|---------------|
| **UsersService** | Both apps | bcrypt-hashed CRUD, login (JWT sign), token blacklist, validateUser() |
| **BookingService** | customer booking/ | Create booking, seat availability (DB + Redis), pricing, WS events, lock/unlock seats (Redis 420s), session state machine |
| **PaymentService** | customer booking/ | Create payment, validate booking, server-side pricing, PDF ticket, WS notifications |
| **PaymentService** | company payment/ | Financial summary (total revenue, monthly, daily, top trips, recent), performance analytics |
| **BusesService** | company buses/ | Bus CRUD, plate uniqueness via JSON path, duplicate detection |
| **TripsService** | company trips/ | Trip CRUD, search with available seats, Redis seat blocking, station booking |
| **TripSchedulerService** | company trips/ | Cron job (every minute): auto-transitions SCHEDULED → IN_PROGRESS → COMPLETED |
| **RihlaWsGateway** | @app/websocket | Socket.IO server, room-based messaging, emit helpers |
| **PDFService** | @app/pdf | PDF ticket generation (pdfmake, Tajawal font, Arabic RTL) |
| **NotificationsService** | customer | In-app persistence + WebSocket push |

### Validation Pattern
All DTOs use `class-validator` + `class-transformer`. Global `ValidationPipe` with `{ whitelist: true, forbidNonWhitelisted: true, transform: true }` on company/admin; `{ whitelist: true, transform: true }` on customer. Custom file validators: `ArabicFileSizeValidator` (5MB max), `ArabicFileTypeValidator` (JPEG/PNG/WebP/HEIC).

### Backend Deployment
- **GitHub**: `https://github.com/shaiba97/Rihla-Backend.git`
- **Deployed**: `https://rihla-backend-rbh7.onrender.com` — Health: `{"status":"ok"}`
- **Git status**: Dirty (2 modified: PDF service +1466/-673 lines uncommitted)
- **Public API gateway**: Admin service (port 3000) proxies `/api-customer/*` → customer, `/api-company/*` → company
- **Render plan**: Docker web service + managed Redis (free, noeviction)

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | HS256 signing key (32+ chars) |
| `NODE_ENV` | No | development | Environment |
| `ADMIN_PORT` | No | 3000 | Admin service port |
| `COMPANY_PORT` | No | 3001 | Company service port |
| `CUSTOMER_PORT` | No | 3002 | Customer service port |
| `CORS_ORIGINS` | No | comma-separated dev origins | Allowed CORS origins |
| `REDIS_HOST` | No | — | Redis host (no host = graceful degradation) |
| `REDIS_PORT` | No | 6379 | Redis port |
| `REDIS_PASSWORD` | No | — | Redis password |
| `WHATSAPP_ENABLED` | No | false | Enable WhatsApp bot |
| `WHATSAPP_PHONE_NUMBER_ID` | No | — | Meta WhatsApp API |
| `WHATSAPP_ACCESS_TOKEN` | No | — | Meta WhatsApp API |
| `UPLOAD_DIR` | No | ./uploads | File upload directory |
| `MAX_UPLOAD_SIZE` | No | 52428800 | 50MB |

---

## Customer Frontend (Angular 21.2.7 + Capacitor)

### Architecture: Responsive Dual-Shell + Signals State

**Shells**:
- `WebShell` (route `/`) — Desktop navbar, user menu, theme toggle, notification bell
- `MobileShell` (route `/m`) — Bottom tab nav (Home, Bookings, Notifications, Blogs, Profile)

**Responsive Pattern**: Each major page uses a responsive wrapper that conditionally renders desktop or mobile variant based on `useIsMobile()` (768px breakpoint). Wrappers: `ResponsiveHome`, `ResponsiveSearchResults`, `ResponsiveLogin`, `ResponsiveRegister`, `ResponsiveBookings`, `ResponsiveProfile`.

### Routing

```
/ (WebShell)
├── /home → ResponsiveHome (Desktop: SearchHero + TripList; Mobile: simple list)
├── /search-results → ResponsiveSearchResults
├── /login → ResponsiveLogin
├── /register → ResponsiveRegister
├── /bookings → ResponsiveBookings
├── /profile → ResponsiveProfile
├── /notifications, /notifications/:id
├── /blogs, /blogs/blog/:slug
├── /seat/:tripId, /passenger, /payment  (mobile-style, shared)
/m (MobileShell)
├── /m/home, /m/bookings, /m/profile, /m/notifications, /m/blogs
├── /m/login, /m/register, /m/results
├── /m/seat/:tripId, /m/passenger, /m/payment
```

### Booking Flow

**Desktop** (modal-based): TripCard → BookingModal (3-step: seat selection → passenger details → payment with receipt upload)  
**Mobile** (multi-page): SearchResults → SelectSeat → PassengerDetails → PaymentDetails

### Services

| Service | Purpose |
|---------|---------|
| `AuthStoreService` | Auth state via signals, localStorage persistence |
| `SessionService` | Booking session with 7-min countdown, seat lock/unlock |
| `BookingService` (x2: services/ + core/services/) | Trip details, booked seats, create booking, confirm payment (FormData for file uploads) |
| `TripSearchService` | City list, trip search, all trips |
| `WsService` | Socket.IO client, room join (`customer:{id}`), seat watching |
| `NotificationsService` | WS-based real-time notifications, sound effects, browser notifications |
| `ThemeService` | Dark/light mode via CSS class + localStorage |
| `BlogService` | Blog post list + detail |
| `Assets` | Static Sudanese cities data |

### Tech Details
- Standalone components (no NgModules), Angular 21.2.7
- Tailwind CSS v4, Arabic RTL (`ar-SA` locale), Tajawal font
- Lucide Angular icons
- Capacitor 8.3.3 (Android/iOS), app ID `com.rihla.app`
- SSR with Express (RenderMode.Client for all routes)
- Build configs: `production` (SSR), `mobile` (CSR), `development`
- **GitHub**: `https://github.com/shaiba97/rihla-customer-frontend.git`
- **Deployed**: `https://rihla-customer-frontend.onrender.com` — Title: `رحلة`
- **Git status**: 8 commits ahead of remote, 25 dirty files (unpushed work)
- Auth interceptor attaches `Authorization: Bearer <token>` to all requests
- No NgRx — pure Angular signals + localStorage

---

## Company Frontend (Angular 21.2.7 + Capacitor)

### Architecture

**Shell**: `LayoutComponent` with `SidebarComponent` (desktop) + `TopbarComponent` + mobile bottom nav. Responsive: sidebar on desktop, bottom tab bar on mobile.

### Routing

```
/auth → lazy-loaded
  /auth/login → LoginComponent
/ → LayoutComponent [guarded: authGuard]
  /dashboard → DashboardComponent (default)
  /buses → BusesComponent
  /buses/bus/:id → BusDetailsComponent
  /trips → TripsComponent
  /trips/trip/trip-details/:id → TripDetailsComponent
  /financials → FinancialsComponent
  /profile → ProfileComponent
** → redirect to /auth/login
```

### Pages & Features

| Page | Features |
|------|----------|
| **Login** | Reactive form (email/phone + password), Arabic UI, auto-detect input type |
| **Dashboard** | Financial stats cards, upcoming/recent trips, bookings table, fleet overview, responsive |
| **Trips** | Grid of trip cards, CRUD with modals, validation, delete confirmation |
| **Trip Details** | Trip/bus info, bookings table, station booking creation, ticket PDF viewer, passenger list download |
| **Buses** | Card grid, CRUD with modals, plate info display |
| **Bus Details** | Bus info + associated trips list |
| **Financials** | Revenue cards, ApexCharts bar chart (daily revenue), top trips, recent payments, performance tables (daily/weekly/monthly/quarterly/half-yearly/yearly) |
| **Profile** | Inline editing of name/email, account deletion with confirmation |

### Services

| Service | Endpoints | Purpose |
|---------|-----------|---------|
| `AuthService` | Users CRUD + login/logout | Signal-based auth state, localStorage persistence |
| `TripService` | Trips + bookings CRUD | Full CRUD + booking management + passenger PDF |
| `BusService` | Buses CRUD | Full CRUD with property-based queries |
| `FinancialsService` | `summary`, `performance` | Financial analytics |
| `ThemeService` | — | Dark/light mode, respects prefers-color-scheme |
| `WsService` | Socket.IO | Real-time: booking:created, trip:status-changed, seat:updated |

### Tech Details
- Standalone components, Angular 21.2.7, SSR (Express, port 4000)
- Tailwind CSS v4 with custom brown/earthy palette (`#8B5E3C` primary)
- ApexCharts via `ng-apexcharts` v2.4.0
- Capacitor 8.3.1, app ID `com.rihla.company`
- Auth guard redirects to `/auth/login` if not authenticated
- Auth interceptor attaches Bearer token
- Pipes: `ArabicNumberPipe` (Latin→Arabic-Indic numerals), `DurationPipe` (trip duration in Arabic)
- All component styling via Tailwind utility classes (no CSS files)
- **GitHub**: `https://github.com/shaiba97/rihla-company-frontend.git`
- **Deployed**: `https://rihla-company-frontend.onrender.com` — Title: `رحلة — لوحة تحكم الشركة`
- **Git status**: ✅ Clean, up to date with origin (9 commits)

---

## Admin Frontend (Angular 21.2.7)

Separate Angular project in `admin/` directory with its own `.git/` (nested repo). Same Angular/Tailwind/Capacitor stack.

**GitHub**: `https://github.com/shaiba97/rihla-admin-frontend.git`  
**Deployed**: `https://rihla-admin-frontend.onrender.com` — Title: `رحلة | لوحة الإدارة`  
**Status**: ✅ Clean, up to date with origin (11 commits)

**Capabilities**: Users CRUD, platform fee management, payment accounts, expenses, support contacts, blog posts (full CRUD), notifications management, financial analytics dashboard.

---

## Git Architecture & Deployment

### Repository Structure (Nested Git Repos)

The project uses a **monorepo-with-nested-repos** pattern (NOT git submodules). The root `Rihla` repo tracks all files, and each subdirectory has its own independent `.git` tracking the same files. This means changes in one can diverge from the other.

| Repo | GitHub URL | Local Dir | Files | Status |
|------|-----------|-----------|-------|--------|
| **Root** | `shaiba97/Rihla.git` | `/Rihla` | 840 | Dirty (8 modified + 2 untracked) |
| **Backend** | `shaiba97/Rihla-Backend.git` | `/Rihla/backend` | 396 | Dirty (2 files: massive PDF service rewrite) |
| **Customer** | `shaiba97/rihla-customer-frontend.git` | `/Rihla/customer` | 203 | 8 commits ahead of remote, 25 dirty files |
| **Company** | `shaiba97/rihla-company-frontend.git` | `/Rihla/company` | 141 | Clean, up to date |
| **Admin** | `shaiba97/rihla-admin-frontend.git` | `/Rihla/admin` | 82 | Clean, up to date |

### Git Status Breakdown

**Root repo** (`origin/main` = `3238137`):
- Last 5 commits: PDF generator improvements, mobile bottom nav restore, logo fixes, notification bell, auth fix
- Dirty: 8 customer/ files (trip-card, passenger-details, payment-details, search-results, select-seat, booking-modal)
- Untracked: `Rihla-project-memory.md`, `test_deepseek.py`
- Extra remotes: `customer-frontend` + `backend-repo` for cross-sync

**Backend** (`origin/main` = `ff6b3de`, local = `4dcd1d5`):
- Last 5 commits: Passenger data in payment response, PDF A5 ticket redesign, pdfmake font fixes
- Dirty: `payment.service.ts` (+20), `pdf.service.ts` (+1466/-673) — massive A5 ticket redesign in progress
- Two remotes: `origin` + `backend-origin` (both same URL)

**Customer frontend** (`origin/main` = `3238137`, local = `c26b3e2`):
- **8 commits ahead of remote** — unpushed work
- Local changes: PDF download fixes (blob vs window.open), notification bell, login/register flow improvements, auth service cleanup
- Dirty: 25 modified files (notifications service, webshell layout, auth pages, bookings, trip-card, mobile shell)

**Company frontend** (`origin/main` = `bcda892` — clean):
- 9 commits total (initial setup → SSR → proxy paths → time format fix)
- All pushed, no uncommitted changes

**Admin frontend** (`origin/main` = `91386f9` — clean):
- 11 commits total (initial setup → SSR → proxy paths → passenger table → admin logo)
- All pushed, no uncommitted changes

### Deployment (Render — Free Tier)

All services sleep after ~15min of inactivity; cold start takes 30-60s.

| Service | URL | Status | Title/Response |
|---------|-----|--------|----------------|
| **Backend** | `https://rihla-backend-rbh7.onrender.com` | ✅ Live | Health: `{"status":"ok"}` |
| **Customer** | `https://rihla-customer-frontend.onrender.com` | ✅ Live | Title: `رحلة` |
| **Company** | `https://rihla-company-frontend.onrender.com` | ✅ Live | Title: `رحلة — لوحة تحكم الشركة` |
| **Admin** | `https://rihla-admin-frontend.onrender.com` | ✅ Live | Title: `رحلة | لوحة الإدارة` |

### Public API Access (Live Data Confirmed)

The backend is publicly accessible (no global auth — auth is per-endpoint):

- `GET /api/health` → `{"status":"ok"}`
- `GET /api-customer/users/get-users` → Returns **29 users** with roles: ADMIN (6), COMPANY (6), USER (17)
  - Sample users: "اخيم السماني" (ADMIN), "مدير النظام" (ADMIN), "حسن شيبة" (USER), "شركة الرفاعي" (COMPANY)
- `GET /api-company/trips/get-trips` → Returns **7 trips** with full booking data
  - Routes include: بورتسودان→كسلا, الخرطوم→ود مدني, دنقلا→الدامر, كادوقلي→الفاشر, etc.
  - 28+ confirmed bookings with PDF tickets generated via pdfmake
  - Trip prices: 45,000-120,000 SDG (Sudanese Pounds)
  - Buses: "الرفاعي" (49 chairs, plate: ب ا ص 1 1 1)
  - Statuses: SCHEDULED, COMPLETED, IN_PROGRESS (managed by cron scheduler)

**This confirms the platform is actively being used with real trip data.**

### API Routing Structure

The **admin service** (port 3000) is the public API gateway:
- `/api/*` → Admin service directly
- `/api-customer/*` → Proxied to customer service (port 3002) as `/api/*`
- `/api-company/*` → Proxied to company service (port 3001) as `/api/*`

### CI/CD
No CI/CD pipeline files exist. Render auto-deploys on branch push to the respective GitHub repos. CI/CD is listed as future work.

### Infrastructure Architecture

```
                         ┌─────────────────────────┐
                         │      Render Cloud        │
                         │                         │
                         │  rihla-backend (Docker)  │
                         │  ├── Admin API :3000     │◄── Gateway / API
                         │  ├── Company API :3001   │
                         │  ├── Customer API :3002  │
                         │  └── nginx :8080         │
                         │         │                │
                         │  rihla-redis (managed)   │
                         └─────────────────────────┘
                                │           │           │
                    ┌───────────┘           │           └───────────┐
                    ▼                       ▼                       ▼
    rihla-customer-frontend    rihla-company-frontend     rihla-admin-frontend
    (Angular SSR :4100)        (Angular SSR :4000)       (Angular SSR :4000)
    Title: "رحلة"              Title: "رحلة — لوحة        Title: "رحلة | لوحة
                                       تحكم الشركة"              الإدارة"
```

### Local Development (Docker Compose)
```
redis:7-alpine → backend:8080 (nginx) → admin:4000, customer:4100, company:4200
```
Backend env from `./backend/.env`, Redis host/port overridden for Docker networking. No PostgreSQL container (expects external DB).

---

## Known Issues & Technical Debt

1. **Hardcoded API key** in `test_deepseek.py` (`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`) — security leak, must revoke
2. **In-memory token blacklist** (`Set<string>`) — tokens survive server restarts
3. **Duplicate services** — `BookingService` and `SessionService` exist in both `services/` and `core/services/` on customer frontend (refactoring artifact)
4. **TypeORM entity files** exist in `entity/` directories but are unused (Prisma-only project)
5. **Generic property-based query endpoints** (`get-X/property/:property/value/:value`) expose any DB field dynamically without validation
6. **Empty CSS files** — all styling is inline via Tailwind classes
7. **`ngClass` + `ngModel`** used in some places despite project conventions preferring signals
8. **No route guards** on customer frontend — auth checks done imperatively in components
9. **Nested git repos risk divergence** — root repo and sub-repos track the same files independently; committing in one doesn't update the other's history
10. **No PostgreSQL in Docker Compose** — expects external database
11. **Customer frontend 8 commits ahead of remote** — unpushed work may be lost if not pushed
12. **Backend PDF service massively rewritten** (+1466/-673 lines) but uncommitted
13. **Render free tier sleeps** — 30-60s cold starts on every request after inactivity
14. **No monitoring or error tracking** — no Sentry, DataDog, or equivalent
15. **Public API access** — `/api-customer/users/get-users` returns all user data without auth (endpoint-level auth missing)

---

## Key Configuration Files

| File | Purpose |
|------|---------|
| `backend/.env.example` | All env vars template (211 lines) |
| `backend/nest-cli.json` | Monorepo workspace (7 projects: 3 apps + 4 libraries) |
| `backend/prisma.config.ts` | Prisma CLI config for `libs/prisma/schema.prisma` |
| `backend/render.yaml` | Render blueprint (web service + Redis) |
| `docker-compose.yml` | Local dev orchestration (5 services) |
| `config.yaml` | LiteLLM model alias (DeepSeek V4 Pro) |
| `payment-crud-prompt.md` | AI prompt-as-code for Payment CRUD implementation |
