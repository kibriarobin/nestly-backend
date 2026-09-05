# 🏠 Nestly - Housing & Roommate Management Platform

A backend-focused RESTful API for a housing and roommate management platform where property owners list properties, flats, and rooms; tenants search, apply, and book with real payment processing; and admins moderate the entire platform.

**Live API:** https://nestly-backend.vercel.app

**API Documentation:** https://github.com/kibriarobin/nestly-backend/blob/main/nestly_postman_collection.json

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication & Roles](#authentication--roles)
- [Payment Flow](#payment-flow)

---

## Overview

**Problem:** Property owners need a structured way to list flats/rooms, while tenants need a trustworthy process to search, apply, book, and pay online instead of relying on unorganized Facebook groups or middlemen.

**Solution:** Nestly provides a secure backend API where:
- Owners create property/flat/room listings (subject to admin approval)
- Tenants search, apply, and book a flat or a single room
- Applications go through an approval workflow before booking
- Real payment (SSLCommerz) confirms the booking
- Admins moderate listings, manage users, and monitor platform activity via audit logs

---

## Tech Stack

| Category | Technology |
|---|---|
| Runtime & Framework | Node.js, TypeScript, Express.js |
| Database & ORM | PostgreSQL + Prisma |
| Validation | Zod |
| Authentication | JWT (access + refresh) + Google OAuth (Passport.js) |
| Payments | SSLCommerz |
| Security | Helmet, express-rate-limit, bcrypt, CORS |
| Deployment | Vercel (Serverless Functions) |

---

## Features

- **Three roles:** OWNER, TENANT, ADMIN - strictly enforced via role-based middleware
- **Email/Password + Google OAuth** authentication with JWT access & refresh tokens
- **Property → Flat → Room** hierarchy; tenants can rent an entire flat or a single room
- **Admin-moderated listings** - properties start as `PENDING`, must be `APPROVED` before appearing in public search
- **Application → Approval → Booking → Payment** workflow with transaction-safe status updates (prevents double-booking)
- **Real payment integration** via SSLCommerz with idempotent webhook handling
- **Reviews** - only tenants with a confirmed booking can review a property
- **Audit logs** - every critical status change (approvals, rejections, cancellations, payments, user blocks) is logged
- **Soft deletes** throughout (no hard deletes)
- **Pagination, filtering, and search** on all list endpoints
- **Rate limiting** and **Helmet** security headers

---

## Architecture

Layered, modular architecture:

```
Routes → Controllers → Services → Prisma → PostgreSQL
```

```
src/
├── config/index.ts          # environment variable exposure
├── utils/
│   ├── AppError.ts          # custom error class
│   ├── catchAsync.ts        # async route handler wrapper
│   ├── sendResponse.ts      # standard response envelope
│   ├── jwt.ts                # JWT sign/verify helpers
│   └── passport.ts           # Google OAuth strategy
├── lib/prisma.ts             # shared PrismaClient instance
├── middleware/
│   ├── checkAuth.ts          # JWT + role-based auth guard
│   ├── validateRequest.ts    # Zod validation middleware
│   ├── globalErrorHandler.ts
│   ├── notFound.ts
│   └── rateLimiter.ts
├── module/
│   ├── auth/
│   ├── user/
│   ├── property/
│   ├── flat/
│   ├── room/
│   ├── application/
│   ├── booking/
│   ├── payment/
│   ├── review/
│   └── admin/
│       └── (route.ts, controller.ts, service.ts, validation.ts, interface.ts)
├── app.ts
└── server.ts

prisma/
├── schema/               # multi-file Prisma schema
└── migrations/
```

Each module follows a consistent pattern:
- **route.ts** - endpoint definitions, auth/validation middleware
- **controller.ts** - request/response handling only (thin layer)
- **service.ts** - business logic, Prisma queries, transactions
- **validation.ts** - Zod schemas
- **interface.ts** - TypeScript types

**Conventions:** Controllers never call Prisma directly. Services never touch `req`/`res`. Request bodies are explicitly destructured before reaching Prisma (never spread) to prevent privilege escalation.

---

## Database Schema

**Entities:** User, Property, Flat, Room, Application, Booking, Payment, Review, AuditLog

**Key relationships:**
```
User (OWNER) → Property → Flat → Room
User (TENANT) → Application → Booking → Payment
                              → Review
User → AuditLog (actor)
```

**Status workflow:**
```
Property:     PENDING → APPROVED / REJECTED / SUSPENDED
Flat/Room:    AVAILABLE → RESERVED → OCCUPIED (or MAINTENANCE / INACTIVE)
Application:  PENDING → UNDER_REVIEW → APPROVED / REJECTED / CANCELLED → CONFIRMED
Booking:      PENDING → CONFIRMED / CANCELLED / COMPLETED
Payment:      PENDING → PAID / FAILED / CANCELLED / REFUNDED
```

Full schema lives in `prisma/schema/`.

---

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL database
- SSLCommerz sandbox account
- Google Cloud OAuth credentials

### Installation

```bash
git clone <repo-url>
cd nestly-backend
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in the values (see [Environment Variables](#environment-variables) below).

### Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

### Run locally

```bash
npm run dev
```

Server starts on `http://localhost:5000`. An admin user is automatically seeded from your `.env` credentials on first run.

---

## Environment Variables

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=

APP_URL=
FRONTEND_URL=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

BCRYPT_SALT_ROUNDS=12

SSL_STORE_ID=
SSL_STORE_PASSWORD=
SSL_SUCCESS_URL=
SSL_FAIL_URL=
SSL_CANCEL_URL=
SSL_IS_LIVE=false

ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
```

---

## API Endpoints

All endpoints are prefixed with `/api/v1`. Full request/response details are in the [Postman Collection](#).

| Module | Base Path | Endpoints |
|---|---|---|
| Auth | `/auth` | register, login, refresh-token, logout, google, google/callback |
| User | `/users` | me (GET/PATCH) |
| Property | `/properties` | CRUD, my-properties, status (admin approve/reject) |
| Flat | `/flats` | CRUD, my-flats |
| Room | `/rooms` | CRUD, my-rooms |
| Application | `/applications` | create, my-applications, owner-applications, approve, reject, cancel |
| Booking | `/bookings` | list, my-bookings, owner-bookings, cancel |
| Payment | `/payments` | create, confirm, list, get-by-id |
| Review | `/reviews` | CRUD, property reviews |
| Admin | `/admin` | users, user status, dashboard-stats, owner-stats, audit-logs |

**Response format (consistent across all endpoints):**

Success:
```json
{ "success": true, "statusCode": 200, "message": "...", "data": {} }
```

Error:
```json
{ "success": false, "statusCode": 400, "message": "...", "errors": [] }
```

---

## Authentication & Roles

- **Email/Password:** register with a chosen role (`OWNER` or `TENANT` - `ADMIN` is not self-registrable)
- **Google OAuth:** `GET /api/v1/auth/google` — must be opened in a **browser**, not Postman, since it requires an interactive Google consent screen. New Google sign-ups default to `TENANT`.
- **JWT:** access token (short-lived) + refresh token (long-lived), delivered via httpOnly cookies and in the response body
- **Authorization:** role-based middleware (`auth(...roles)`) protects every private route; ownership checks (e.g. an owner can only modify their own property) are enforced in the service layer

---

## Payment Flow

```
Tenant applies → Owner approves (Booking created, PENDING; Room/Flat RESERVED)
       ↓
Tenant initiates payment (POST /payments/create) → SSLCommerz hosted page
       ↓
Tenant completes payment on SSLCommerz (sandbox)
       ↓
SSLCommerz redirects to /payments/confirm → backend validates with SSLCommerz's API
       ↓
Transaction: Payment → PAID, Booking → CONFIRMED, Room/Flat → OCCUPIED, Application → CONFIRMED
```

Handles idempotent webhook replays and guards against confirming payment on an already-cancelled booking.

---