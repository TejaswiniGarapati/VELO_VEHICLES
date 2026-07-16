# VELO - Vehicle E-Services

A full-stack web application for vehicle-related payments and services. College mini project with React frontend, Node.js/Express backend, and MongoDB.

## Tech Stack

- **Frontend:** React, HTML, CSS, JavaScript, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT

## Theme

- Classic, minimal design
- Primary colors: White and Light Blue

## User Roles

1. **Normal User** – Signup, login, manage payments (tollgate, fuel, insurance, tax, e-challan), view notifications
2. **Admin** – View all users, monitor payments, view notifications, app activity

---

## Setup & Run

### 1. MongoDB

Ensure MongoDB is running locally (e.g. `mongod`), or set `MONGODB_URI` in backend `.env`.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set PORT, MONGODB_URI, JWT_SECRET
npm install
npm start
```

Server runs at `http://localhost:5000`.

**Create admin user (optional):**

```bash
node scripts/seedAdmin.js
```

Default admin: `admin@velo.com` / `admin123` (override with `ADMIN_EMAIL`, `ADMIN_PASSWORD` in `.env`).

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000`. The frontend is configured to proxy API requests to `http://localhost:5000` in development.

---

## Folder Structure

```
VELO/
├── backend/
│   ├── controllers/   # auth, user, payment, notification, admin
│   ├── middleware/   # authMiddleware (JWT, adminOnly)
│   ├── models/       # User, Vehicle, Payment, Notification
│   ├── routes/       # auth, user, payment, notification, admin
│   ├── scripts/      # seedAdmin.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # Navbar, PrivateRoute, PaymentModal
│   │   ├── context/     # AuthContext
│   │   ├── pages/       # Login, Signup, Home, payment modules, Admin, Notifications
│   │   ├── services/    # api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

---

## Features

- **Auth:** Signup (name, phone, email, password, CAPTCHA), Login (email or phone + password)
- **User Home:** Welcome message, vehicle images, quick links
- **Payments:** Tollgate (FASTag), Fuel, Insurance, Environmental checkup info, Tax, E-Challan
- **Payment options:** UPI, Bank transfer, Card (Debit/Credit)
- **Notifications:** Stored on payment success; accessible via Bell icon
- **Admin:** View users, payments, notifications, activity

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user (token) |
| GET | /api/payments/overview | Dashboard data |
| POST | /api/payments/tollgate | FASTag recharge |
| POST | /api/payments/fuel | Fuel payment |
| POST | /api/payments/insurance | Insurance renewal |
| POST | /api/payments/tax | Tax payment |
| POST | /api/payments/challan | E-Challan payment |
| GET | /api/notifications | User notifications |
| GET | /api/admin/users | All users (admin) |
| GET | /api/admin/payments | All payments (admin) |
| GET | /api/admin/notifications | All notifications (admin) |
| GET | /api/admin/activity | Activity overview (admin) |

---

## Academic Use

Code is structured for readability and explanation:

- Comments on important logic in backend and frontend
- Clear separation: routes → controllers → models
- Middleware for auth and admin checks
- Reusable React components and context for auth

Suitable for demonstrations and reports.
