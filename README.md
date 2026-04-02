# Finance Dashboard Backend API

A RESTful backend for a finance dashboard system with role-based access control, JWT authentication, financial record management, and dashboard analytics.

---

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MySQL
- **Auth**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Password Hashing**: bcryptjs

---

## Project Structure

```
finance-backend/
├── sql/
│   └── schema.sql              # Database schema + seed data
├── src/
│   ├── app.js                  # Entry point
│   ├── config/
│   │   └── db.js               # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── recordController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js             # verifyToken, verifyRole guards
│   │   └── validate.js         # express-validator error handler
│   ├── models/
│   │   ├── userModel.js        # User DB queries
│   │   └── recordModel.js      # Financial record DB queries + aggregations
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── recordRoutes.js
│   │   └── dashboardRoutes.js
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── userValidator.js
│   │   └── recordValidator.js
│   └── utils/
│       └── response.js         # Standardized response helpers
├── .env.example
├── .gitignore
└── package.json
```

---

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd finance-backend
npm install
```

### 2. Configure environment

**Linux/macOS**
```bash
cp .env.example .env
```

**Windows (PowerShell)**
```powershell
Copy-Item .env.example .env
```

Edit `.env` with your MySQL credentials and a strong JWT secret:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=finance_dashboard
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```

### 3. Set up the database

**Linux/macOS**
```bash
mysql -u root -p < sql/schema.sql
```

**Windows (PowerShell)**
```powershell
Get-Content -Raw "sql\schema.sql" | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

This creates the `finance_dashboard` database, all tables, and seeds a default admin user.

**Default admin credentials:**
```
Email:    admin@finance.com
Password: password
```

> Change this password immediately after first login.

### 4. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000`.

---

## Roles and Permissions

| Action                          | Viewer | Analyst | Admin |
|---------------------------------|--------|---------|-------|
| Login / view own profile        | ✅     | ✅      | ✅    |
| View financial records          | ❌     | ✅      | ✅    |
| Dashboard summary + activity    | ✅     | ✅      | ✅    |
| Category totals + monthly trends| ❌     | ✅      | ✅    |
| Create / update / delete records| ❌     | ❌      | ✅    |
| Manage users                    | ❌     | ❌      | ✅    |

---

## API Reference

All responses follow this shape:

```json
{
  "success": true | false,
  "message": "...",
  "data": { ... }
}
```

Validation errors return `422` with an `errors` array:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    { "field": "email", "message": "Valid email is required." }
  ]
}
```

Protected routes require:
```
Authorization: Bearer <token>
```

---

### Auth

#### `POST /api/auth/register`

Register a new user. Public registration always creates a `viewer` account.

**Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": { "id": 2 }
}
```

---

#### `POST /api/auth/login`

**Body:**
```json
{
  "email": "admin@finance.com",
  "password": "password"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGci...",
    "role": "admin",
    "name": "Admin User"
  }
}
```

---

#### `GET /api/auth/me` 🔒

Returns the currently authenticated user's profile.

**Response `200`:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@finance.com",
    "role": "admin",
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Users (Admin only)

#### `GET /api/users` 🔒 Admin

Query params: `?status=active&role=analyst`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "users": [ { "id": 1, "name": "...", "role": "admin", ... } ]
  }
}
```

---

#### `GET /api/users/:id` 🔒 Admin

---

#### `POST /api/users` 🔒 Admin

Creates a user with `viewer` role. Role assignment to `analyst` or `admin` is done later via `PATCH /api/users/:id`.

**Body:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "password": "pass123",
  "role": "viewer"
}
```

---

#### `PATCH /api/users/:id` 🔒 Admin

Only `name`, `role`, and `status` can be updated.
Role changes are restricted to promotions from `viewer` to `analyst` or `admin`.

**Body (all fields optional):**
```json
{
  "role": "analyst",
  "status": "inactive"
}
```

---

#### `DELETE /api/users/:id` 🔒 Admin

Permanently deletes a user. Admins cannot delete their own account.

---

### Financial Records

#### `GET /api/records` 🔒 Analyst + Admin

Query params: `?type=income&category=salary&startDate=2024-01-01&endDate=2024-12-31`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 1,
        "user_id": 1,
        "amount": "5000.00",
        "type": "income",
        "category": "Salary",
        "date": "2024-03-01",
        "notes": "March salary",
        "created_by_name": "Admin User"
      }
    ]
  }
}
```

---

#### `GET /api/records/:id` 🔒 Analyst + Admin

---

#### `POST /api/records` 🔒 Admin only

**Body:**
```json
{
  "amount": 1200.50,
  "type": "expense",
  "category": "Rent",
  "date": "2024-03-05",
  "notes": "Monthly office rent"
}
```

**Response `201`:** Returns the created record object.

---

#### `PATCH /api/records/:id` 🔒 Admin only

All fields optional. Only provided fields are updated.

**Body:**
```json
{
  "amount": 1300.00,
  "notes": "Updated rent amount"
}
```

---

#### `DELETE /api/records/:id` 🔒 Admin only

Soft deletes the record (sets `is_deleted = 1`). The record is excluded from all queries but preserved in the database.

---

### Dashboard

#### `GET /api/dashboard/summary` 🔒 All roles

Optional query params: `?startDate=2024-01-01&endDate=2024-12-31`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "total_income": 25000,
    "total_expenses": 14200,
    "net_balance": 10800
  }
}
```

---

#### `GET /api/dashboard/recent-activity` 🔒 All roles

Query params: `?limit=10` (max 50)

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "amount": "500.00",
      "type": "expense",
      "category": "Utilities",
      "date": "2024-03-10",
      "notes": null,
      "created_by": "Admin User"
    }
  ]
}
```

---

#### `GET /api/dashboard/category-totals` 🔒 Analyst + Admin

Optional query params: `?type=expense&startDate=2024-01-01&endDate=2024-12-31`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "category": "Rent", "type": "expense", "total": "3600.00", "count": 3 },
    { "category": "Salary", "type": "income", "total": "15000.00", "count": 3 }
  ]
}
```

---

#### `GET /api/dashboard/monthly-trends` 🔒 Analyst + Admin

Query params: `?year=2024`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "month": "2024-01", "income": "5000.00", "expenses": "3200.00" },
    { "month": "2024-02", "income": "5000.00", "expenses": "4100.00" }
  ]
}
```

---

## Assumptions

1. **Record ownership vs. visibility** — Analysts and admins can view all financial records. Viewers cannot access record endpoints. The `user_id` on a record tracks who *created* it, not who *owns* the data.

2. **Analyst cannot modify records** — Analysts are read-only for data but get access to deeper analytics (category totals, trends). Only admins mutate data.

3. **Soft delete for records** — Financial records are soft-deleted (`is_deleted = 1`) to preserve audit history. Users are hard-deleted since they are not financial data.

4. **Registration and user creation are viewer-first** — Public registration and admin user creation both create `viewer` accounts. Only admins can promote a viewer to `analyst` or `admin` via `PATCH /api/users/:id`.

5. **No refresh tokens** — JWTs are long-lived (7 days). For a production system, refresh token rotation would be added.

---

## Error Reference

| Code | Meaning                                  |
|------|------------------------------------------|
| 400  | Bad request (e.g. self-deletion attempt) |
| 401  | Missing or invalid JWT                   |
| 403  | Valid JWT but insufficient role          |
| 404  | Resource not found                       |
| 409  | Conflict (e.g. email already exists)     |
| 422  | Validation failed (see `errors` array)   |
| 500  | Internal server error                    |
