## Dental Management System Backend – Security Review

This document gives a production-focused overview of the main security controls and operational guidance for this backend.

### 1. Secrets & Environment

- **Store all secrets outside of source control**:
  - `.env` must never be committed (already in `.gitignore`).
  - Secrets: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `MEDICAL_RECORD_ENC_KEY_B64`, Cloudinary keys.
- **Key management**:
  - `JWT_*_SECRET` values should be long, random (64+ chars).
  - `MEDICAL_RECORD_ENC_KEY_B64` must decode to **32 bytes** (AES-256-GCM).
  - Rotate JWT and encryption keys on a schedule; when rotating encryption keys, plan for re-encryption or dual key-support if required.
- **Config per environment**:
  - Use separate env files or secret stores (e.g. Vault, AWS Secrets Manager) per environment (`NODE_ENV=production` in prod).

### 2. Transport Security (TLS)

- Terminate TLS at the load balancer or reverse proxy (e.g. Nginx, AWS ALB, Cloudflare).
- Enforce HTTPS only:
  - HSTS at the edge.
  - Redirect HTTP → HTTPS.
- Never expose the API over plain HTTP on the public internet without TLS.

### 3. Database Security & Integrity

- **Network**:
  - Restrict PostgreSQL to private networks/VPC only.
  - Only the API server should be allowed to connect (by IP or security group).
- **Authentication & authz**:
  - Use a dedicated DB user with the minimum privileges needed for this schema.
  - Avoid `superuser` or `rds_superuser` roles for the app.
- **Backups**:
  - Automated daily backups, with tested restore procedures.
  - Consider point-in-time recovery if available.
- **Migrations**:
  - Keep `schema.sql` in sync with the live DB (or adopt a migration tool like `node-pg-migrate` for future changes).

### 4. Application-Level Security Controls

- **Authentication**:
  - Access tokens: 1h expiry, short-lived.
  - Refresh tokens: signed with a separate secret, stored **hashed** in the `refresh_tokens` table and rotated on each refresh.
  - On suspicious activity (e.g. suspected compromise), use `logout-all` to revoke all tokens for a user.
- **Password storage**:
  - Hash with bcrypt at 12 rounds; never log or expose passwords.
  - Enforce strong password policy at the client/UI level (length, complexity).
- **Role-Based Access Control (RBAC)**:
  - `admin`: full access, including audit logs and admin endpoints.
  - `dentist`: medical records and own appointments; cannot manage users.
  - `receptionist`: patient + appointment management only; no medical record access.
  - All routes are wired through `authRequired` + `requireRole/requireAnyRole` for strong separation of duties.

### 5. Data Protection & Privacy

- **Field-level encryption**:
  - Patients: `name`, `phone`, and `medical_history` are encrypted at the application layer using AES-256-GCM.
  - Medical records: `diagnosis`, `treatment`, `notes`, `prescription` are encrypted at rest.
  - This prevents casual inspection at the DB level (DBAs/operators see only ciphertext).
- **Soft deletes & audit trail**:
  - `deleted_at` is used on patients, medical records, appointments, and uploads to avoid hard deletion.
  - `audit_logs` records all sensitive POST/PUT/DELETE operations with `user_id`, `action`, `resource`, `resource_id`, and metadata.
  - Use audit logs for incident investigation and compliance reporting.

### 6. Input Validation & Rate Limiting

- **Validation**:
  - All endpoints use Zod schemas to strictly validate request bodies, query params, and path params.
  - This reduces the risk of injection, broken assumptions, and internal errors.
- **Rate limiting**:
  - Global rate limit: protects the entire API from abuse.
  - Auth-specific limit: stricter `express-rate-limit` on `/api/auth` routes to hinder credential stuffing / brute force.

### 7. Logging & Monitoring

- **Logging**:
  - Log unexpected server errors on the backend (excluding sensitive data such as tokens, passwords, PHI).
  - Do not log full request bodies that may contain PHI.
- **Monitoring**:
  - Use the `GET /api/admin/system-health` endpoint behind admin auth as a basic internal health check.
  - Integrate uptime checks and error rate monitoring (e.g. with Prometheus/Grafana, Datadog, or similar).

### 8. File Upload Security

- Only JPG/PNG/WEBP images and PDFs are accepted, max 5MB per file.
- Files are either:
  - Stored on Cloudinary (if configured), or
  - Stored under a dedicated `/uploads` directory and served under `/uploads` with Express static middleware.
- Recommendations:
  - Ensure the uploads directory is not browsable (index disabled) at the reverse proxy level.
  - If using local storage, consider virus scanning as an out-of-band process.

### 9. Deployment Hardening Checklist

- Run Node.js as a non-root user.
- Keep dependencies updated (run `npm audit` periodically and patch high/critical issues).
- Disable or lock down admin accounts in lower environments.
- Use infrastructure-as-code (Terraform/CloudFormation) to codify network and security rules.
- Regularly review audit logs for unusual patterns (unexpected role changes, mass deletions, unusual login IPs).

