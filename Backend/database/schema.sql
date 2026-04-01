-- Dental Management System - PostgreSQL schema
-- Notes:
-- - Soft delete is implemented using deleted_at (NULL = active)
-- - Refresh tokens are stored hashed (never store raw tokens)
-- - Medical record sensitive fields are encrypted at the application layer

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Roles (constrained by CHECK)
-- admin | dentist | receptionist

CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_hospitals_deleted_at ON hospitals (deleted_at);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'dentist', 'receptionist')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
  avatar_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_hospital_id ON users (hospital_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_hospital_email ON users (hospital_id, email);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  -- Encrypted fields (AES-256-GCM via application layer)
  name_enc TEXT NOT NULL,
  phone_enc TEXT,
  medical_history_enc TEXT,
  -- Non-encrypted fields kept minimal for search / contact
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_patients_deleted_at ON patients (deleted_at);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients (email);
CREATE INDEX IF NOT EXISTS idx_patients_hospital_id ON patients (hospital_id);

CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  -- Encrypted JSON payload: { diagnosis, treatment, notes, prescription } stored as base64 fields with iv+tag
  diagnosis_enc TEXT NOT NULL,
  treatment_enc TEXT NOT NULL,
  notes_enc TEXT,
  prescription_enc TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records (patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_deleted_at ON medical_records (deleted_at);
CREATE INDEX IF NOT EXISTS idx_medical_records_hospital_id ON medical_records (hospital_id);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  -- Reception-facing appointment workflow
  appointment_status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (appointment_status IN ('Scheduled', 'Arrived', 'Completed')),
  -- Billing summary stored as structured JSON (e.g. { total, currency, paid })
  billing_summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_dentist_id ON appointments (dentist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (date);
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON appointments (deleted_at);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON appointments (hospital_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_hospital_id ON audit_logs (hospital_id);

CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'medical_file',
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage TEXT NOT NULL CHECK (storage IN ('local', 'cloudinary')),
  url TEXT,
  cloudinary_public_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_uploads_patient_id ON uploads (patient_id);
CREATE INDEX IF NOT EXISTS idx_uploads_deleted_at ON uploads (deleted_at);
CREATE INDEX IF NOT EXISTS idx_uploads_hospital_id ON uploads (hospital_id);
