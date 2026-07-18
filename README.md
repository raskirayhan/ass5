# FixItNow Backend

> **"Your Trusted Home Service Platform"**

Backend API for a home services marketplace where customers can book technicians for plumbing, electrical, cleaning, painting, and more. Features role-based authentication, Stripe & SSLCommerz payment integration, booking management, and a full admin dashboard.

---

## Tech Stack

| Technology        | Purpose                     |
| ----------------- | --------------------------- |
| Node.js + Express | REST API framework          |
| TypeScript        | Type safety                 |
| PostgreSQL        | Database                    |
| Prisma            | ORM                         |
| JWT               | Authentication              |
| bcrypt            | Password hashing            |
| Zod               | Request validation          |
| Stripe            | Payment processing          |
| Helmet            | Security headers            |
| Rate Limiting     | API protection              |
| Swagger/OpenAPI   | API documentation           |

---

## Features

- JWT Authentication with role-based access (Customer, Technician, Admin)
- Full CRUD for Categories, Services
- Technician profiles with availability management
- Booking system with status flow (`REQUESTED → ACCEPTED → PAID → IN_PROGRESS → COMPLETED`)
- Stripe payment integration with webhooks
- SSLCommerz payment integration
- Review system for completed bookings
- Admin dashboard with user management (ban/unban)
- Pagination, search, filtering, sorting on all list endpoints
- Zod validation on every endpoint
- Global error handling
- Rate limiting and security headers
- Swagger API documentation

---

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

---

## Installation

```bash
git clone https://github.com/raskirayhan/ass5.git
cd ass5
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable                 | Description                                        | Default Value                                                              |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------- |
| `PORT`                   | Server port                                        | `3000`                                                                     |
| `NODE_ENV`               | Environment mode                                   | `development`                                                              |
| `DATABASE_URL`           | PostgreSQL connection string                       | `postgresql://postgres:postgres@localhost:5432/fixitnow?schema=public`      |
| `JWT_SECRET`             | Secret key for signing JWTs                        | `your-super-secret-jwt-key-change-in-production`                           |
| `JWT_EXPIRES_IN`         | JWT token expiration duration                      | `7d`                                                                       |
| `STRIPE_SECRET_KEY`      | Stripe secret API key                              | `sk_test_your_stripe_secret_key`                                           |
| `STRIPE_WEBHOOK_SECRET`  | Stripe webhook endpoint signing secret             | `whsec_your_webhook_secret`                                                |
| `SSLCOMMERZ_STORE_ID`    | SSLCommerz store ID                                | `your_store_id`                                                            |
| `SSLCOMMERZ_STORE_PASSWORD` | SSLCommerz store password                       | `your_store_password`                                                      |
| `SSLCOMMERZ_IS_LIVE`     | Use SSLCommerz live environment                    | `false`                                                                    |
| `CLIENT_URL`             | Frontend URL (for CORS & redirects)                | `http://localhost:3000`                                                    |

---

## Database Setup

```bash
npx prisma migrate dev
npx prisma db seed
npm run prisma:seed
```

---

## Running the Project

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

---

## Scripts

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start dev server with hot reload         |
| `npm run build`         | Compile TypeScript to JavaScript         |
| `npm start`             | Start compiled production server         |
| `npm run prisma:generate` | Generate Prisma client                |
| `npm run prisma:migrate` | Run Prisma migrations                  |
| `npm run prisma:studio` | Open Prisma Studio (visual DB browser)   |
| `npm run lint`          | Type-check with `tsc --noEmit`           |
| `npm run prisma:seed`   | Seed the database                        |

---

## API Documentation

- **Swagger UI:** `http://localhost:3000/api-docs`
- **Swagger JSON:** `http://localhost:3000/api-docs.json`

---

## Postman Collection

Import `postman/fixitnow.postman_collection.json` into Postman.

---

## API Endpoints

### Authentication

| Method | Endpoint              | Description  | Auth Required |
| ------ | --------------------- | ------------ | ------------- |
| POST   | `/api/auth/register`  | Register user| No            |
| POST   | `/api/auth/login`     | Login        | No            |
| GET    | `/api/auth/me`        | Get profile  | Yes           |

### Categories

| Method | Endpoint                         | Description   | Auth Required |
| ------ | -------------------------------- | ------------- | ------------- |
| GET    | `/api/categories`                | List categories | No          |
| GET    | `/api/categories/:id`            | Category details | No          |
| POST   | `/api/categories`                | Create category | Admin       |
| PUT    | `/api/categories/:id`            | Update category | Admin       |
| PATCH  | `/api/categories/:id/toggle-active` | Toggle active status | Admin |

### Services

| Method | Endpoint                | Description       | Auth Required |
| ------ | ----------------------- | ----------------- | ------------- |
| GET    | `/api/services`         | List with filters | No            |
| GET    | `/api/services/:id`     | Service details   | No            |
| POST   | `/api/services`         | Create service    | Technician    |
| PUT    | `/api/services/:id`     | Update service    | Technician    |
| DELETE | `/api/services/:id`     | Delete service    | Technician    |

### Technicians

| Method | Endpoint                          | Description        | Auth Required |
| ------ | --------------------------------- | ------------------ | ------------- |
| GET    | `/api/technicians`                | List with filters  | No            |
| GET    | `/api/technicians/:id`            | Profile details    | No            |
| GET    | `/api/technician/me`              | My profile         | Technician    |
| PUT    | `/api/technician/profile`         | Update profile     | Technician    |
| PUT    | `/api/technician/availability`    | Set availability   | Technician    |
| GET    | `/api/technician/bookings`        | My bookings        | Technician    |

### Bookings

| Method | Endpoint                      | Description       | Auth Required |
| ------ | ----------------------------- | ----------------- | ------------- |
| POST   | `/api/bookings`               | Create booking    | Customer      |
| GET    | `/api/bookings`               | My bookings       | Yes           |
| GET    | `/api/bookings/:id`           | Booking details   | Yes           |
| PATCH  | `/api/bookings/:id/cancel`    | Cancel booking    | Customer      |

### Payments

| Method | Endpoint                        | Description       | Auth Required |
| ------ | ------------------------------- | ----------------- | ------------- |
| POST   | `/api/payments/create`          | Create payment    | Yes           |
| POST   | `/api/payments/confirm`         | Confirm payment   | Yes           |
| POST   | `/api/payments/webhook`         | Stripe webhook    | No            |
| GET    | `/api/payments`                 | Payment history   | Yes           |
| GET    | `/api/payments/:id`             | Payment details   | Yes           |

### Reviews

| Method | Endpoint                               | Description         | Auth Required |
| ------ | -------------------------------------- | ------------------- | ------------- |
| POST   | `/api/reviews`                         | Create review       | Customer      |
| GET    | `/api/reviews/technician/:techId`      | Technician reviews  | No            |

### Admin

| Method | Endpoint                              | Description       | Auth Required |
| ------ | ------------------------------------- | ----------------- | ------------- |
| GET    | `/api/admin/dashboard`                | Dashboard stats   | Admin         |
| GET    | `/api/admin/users`                    | All users         | Admin         |
| PATCH  | `/api/admin/users/:id/status`         | Ban/Unban user    | Admin         |
| GET    | `/api/admin/bookings`                 | All bookings      | Admin         |
| GET    | `/api/admin/categories`               | All categories    | Admin         |
| POST   | `/api/admin/categories`               | Create category   | Admin         |
| PUT    | `/api/admin/categories/:id`           | Update category   | Admin         |
| DELETE | `/api/admin/categories/:id`           | Delete category   | Admin         |
| GET    | `/api/admin/reviews`                  | All reviews       | Admin         |
| GET    | `/api/admin/payments`                 | All payments      | Admin         |

---

## Booking Status Flow

```
┌────────────┐    ┌───────────┐    ┌──────┐    ┌──────────────┐    ┌───────────┐
│  REQUESTED │───▶│  ACCEPTED │───▶│ PAID │───▶│ IN_PROGRESS  │───▶│ COMPLETED │
└────────────┘    └───────────┘    └──────┘    └──────────────┘    └───────────┘
       │
       │ (customer cancels)
       ▼
  ┌─────────┐
  │ CANCELLED│
  └─────────┘
```

- **REQUESTED** - Customer creates a booking
- **ACCEPTED** - Technician accepts the booking
- **PAID** - Customer completes payment (Stripe/SSLCommerz)
- **IN_PROGRESS** - Technician begins the service
- **COMPLETED** - Service is finished
- **CANCELLED** - Customer cancels the booking

---

## Admin Credentials

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `admin@fixitnow.com`   |
| Password | `Admin@12345`          |

---

## Folder Structure

```
fixitnow-backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── prisma/
│   ├── utils/
│   ├── middlewares/
│   ├── interfaces/
│   ├── constants/
│   ├── helpers/
│   ├── modules/
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── services/
│   │   ├── technicians/
│   │   ├── bookings/
│   │   ├── payments/
│   │   ├── reviews/
│   │   └── admin/
│   ├── routes.ts
│   └── swagger.ts
├── postman/
│   └── fixitnow.postman_collection.json
├── docs/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## Deployment (Render)

1. Connect your GitHub repo on [Render](https://render.com)
2. Create a new **Web Service**
3. Configure the following:
   - **Build Command:**
     ```
     npm install && npx prisma generate && npx prisma migrate deploy
     ```
   - **Start Command:**
     ```
     npm start
     ```
4. Add all environment variables from the table above in the Render dashboard

---

## License

ISC
