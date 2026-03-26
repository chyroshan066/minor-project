## Dental Management System Backend (Secure)

Tech: Node.js, Express, PostgreSQL, JWT (access + refresh), Zod validation, Multer uploads, optional Cloudinary storage.

### Setup

- **1) Install deps**

```bash
npm install
```

- **2) Configure env**

Copy `.env.example` to `.env` and fill values.

- **3) Create database + schema**

Run `schema.sql` in your PostgreSQL DB (psql, pgAdmin, etc).

- **4) Start**

```bash
npm run dev
```

Health check: `GET /api/health`

### Auth model

- **Access token**: Bearer token, 1h expiry (configurable).
- **Refresh token**: stored **hashed** in DB, rotation on every refresh.

Registration behavior:
- `POST /api/auth/register`:
  - If the request is authenticated as **admin**, you may specify `role`.
  - Otherwise role is forced to **receptionist**.

### Roles & access

- **admin**: full access, audit logs, admin system endpoints
- **dentist**: medical records CRUD (with prescriptions), view own appointments, daily schedule
- **receptionist**: patient CRUD, appointments CRUD (no medical record access)

### Pagination & filtering

List endpoints accept:
- `page` (default 1), `limit` (default 20, max 100)
- `search` where applicable

### File uploads

- Endpoint: `POST /api/uploads` (multipart form-data)
- Field name: `file`
- **Max**: 5MB (configurable)
- **Allowed**: jpg/png/webp/pdf
- **Storage**: Cloudinary if configured, otherwise local at `/uploads/...`

### API endpoints

#### Auth
- **POST** `/api/auth/setup-hospital` (creates hospital + first admin)
- **POST** `/api/auth/register`
- **POST** `/api/auth/login` (requires `hospital_id`)
- **POST** `/api/auth/refresh`
- **POST** `/api/auth/logout`
- **POST** `/api/auth/logout-all`

#### Users
- **GET** `/api/users/me`
- **GET** `/api/users` (admin)

#### Patients
- **GET** `/api/patients` (search + pagination)
- **POST** `/api/patients` (admin, receptionist) – supports `medical_history` (encrypted)
- **GET** `/api/patients/:id`
- **PUT** `/api/patients/:id` (admin, receptionist) – can update `medical_history`
- **DELETE** `/api/patients/:id` (soft delete) (admin, receptionist)

#### Medical Records (encrypted at rest)
- **POST** `/api/medical-records` (admin, dentist) – includes `prescription`
- **GET** `/api/medical-records/:id` (admin, dentist) – returns `prescription`
- **PUT** `/api/medical-records/:id` (admin, dentist) – can update `prescription`
- **DELETE** `/api/medical-records/:id` (soft delete) (admin, dentist)
- **GET** `/api/patients/:patientId/medical-records` (admin, dentist) (pagination)

#### Appointments
- **GET** `/api/appointments` (filters: `patient_id`, `dentist_id`, `status`, `date_from`, `date_to`)
- **POST** `/api/appointments` (admin, receptionist) – supports `appointment_status` and `billing_summary`
- **GET** `/api/appointments/:id`
- **PUT** `/api/appointments/:id` (admin, receptionist, dentist-own) – can update `appointment_status` / `billing_summary`
- **DELETE** `/api/appointments/:id` (soft delete) (admin, receptionist)

#### Uploads
- **GET** `/api/uploads` (pagination; filter: `patient_id`) (admin, dentist)
- **POST** `/api/uploads` (admin, dentist)
- **DELETE** `/api/uploads/:id` (soft delete) (admin, dentist)

#### Audit logs (admin)
- **GET** `/api/audit-logs` (filters: `user_id`, `action`, `resource`)

#### Dentist
- **GET** `/api/dentists/me/daily-schedule?date=YYYY-MM-DD&page=&limit=` (dentist)

#### Admin
- **GET** `/api/admin/system-health`
- **GET** `/api/admin/inventory-alerts`

