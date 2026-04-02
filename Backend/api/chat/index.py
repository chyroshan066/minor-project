# """
# DentaBot – Python FastAPI Chatbot Microservice (Vercel serverless edition)
# =========================================================================
# Runs as a Vercel serverless function. All database connections are per‑request.
# """

# import os
# import re
# import json
# import base64
# import logging
# from typing import Any

# import asyncpg
# import google.generativeai as genai
# from cryptography.hazmat.primitives.ciphers.aead import AESGCM
# from dotenv import load_dotenv
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel

# # Load environment variables (Vercel injects them automatically, but local dev)
# load_dotenv()

# # ──────────────────────────────────────────
# # Logging
# # ──────────────────────────────────────────
# logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")
# log = logging.getLogger("dentabot")

# # ──────────────────────────────────────────
# # Config
# # ──────────────────────────────────────────
# DATABASE_URL: str = os.environ["DATABASE_URL"]
# GEMINI_API_KEY: str = os.environ["GEMINI_API_KEY"]
# ENC_KEY_B64: str = os.environ["MEDICAL_RECORD_ENC_KEY_B64"]
# ALLOWED_ORIGINS: list[str] = os.getenv(
#     "CORS_ORIGIN", "http://localhost:3000,http://localhost:4000"
# ).split(",")

# genai.configure(api_key=GEMINI_API_KEY)

# app = FastAPI(title="DentaBot", version="1.0.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=ALLOWED_ORIGINS,
#     allow_methods=["POST", "GET"],
#     allow_headers=["*"],
# )


# # ──────────────────────────────────────────
# # Crypto – matches Node backend exactly
# # (AES-256-GCM, same key and pack format)
# # ──────────────────────────────────────────
# def _dec_key() -> bytes:
#     key = base64.b64decode(ENC_KEY_B64)
#     if len(key) != 32:
#         raise ValueError("MEDICAL_RECORD_ENC_KEY_B64 must decode to 32 bytes")
#     return key


# def decrypt_field(b64_packed: str | None) -> str | None:
#     """Decrypt a field encrypted by the Node crypto.js encryptField()."""
#     if not b64_packed:
#         return None
#     try:
#         payload = json.loads(base64.b64decode(b64_packed).decode())
#         iv = base64.b64decode(payload["iv_b64"])
#         tag = base64.b64decode(payload["tag_b64"])
#         data = base64.b64decode(payload["data_b64"])
#         aesgcm = AESGCM(_dec_key())
#         # GCM ciphertext = data || tag  (cryptography lib expects them joined)
#         plaintext = aesgcm.decrypt(iv, data + tag, None)
#         return plaintext.decode()
#     except Exception as exc:
#         log.warning("decrypt_field failed: %s", exc)
#         return None


# # ──────────────────────────────────────────
# # Intent detection
# # ──────────────────────────────────────────
# _INTENTS = {
#     "appointment": re.compile(
#         r"appointment|book|schedule|slot|available|when|timing|visit", re.I
#     ),
#     "patient": re.compile(r"patient|record|history|who is|find patient", re.I),
#     "medical": re.compile(
#         r"diagnosis|treatment|prescription|record|medical", re.I
#     ),
#     "dentist": re.compile(
#         r"doctor|dentist|dr\.|staff|specialist|who treat", re.I
#     ),
#     "hospital": re.compile(
#         r"hospital|clinic|address|contact|location|hours|open|close", re.I
#     ),
#     "billing": re.compile(
#         r"billing|cost|fee|charge|paid|invoice|price", re.I
#     ),
# }


# def detect_intent(msg: str) -> dict[str, bool]:
#     return {k: bool(p.search(msg)) for k, p in _INTENTS.items()}


# # ──────────────────────────────────────────
# # DB context fetcher (hospital-scoped) – per‑request connection
# # ──────────────────────────────────────────
# async def fetch_db_context(message: str, hospital_id: str) -> dict[str, Any]:
#     """
#     Connect to the database, run queries based on intent,
#     and return a context dictionary for the AI.
#     """
#     intent = detect_intent(message)
#     ctx: dict[str, Any] = {}

#     # Open a new connection
#     conn = await asyncpg.connect(DATABASE_URL, ssl="require")
#     try:
#         # ── Appointment stats (always run – lightweight) ──
#         rows = await conn.fetch(
#             """
#             SELECT status, COUNT(*)::int AS count
#             FROM   appointments
#             WHERE  hospital_id = $1 AND deleted_at IS NULL
#             GROUP  BY status
#             """,
#             hospital_id,
#         )
#         if rows:
#             ctx["appointmentStats"] = [dict(r) for r in rows]

#         # ── Upcoming appointments ──
#         if intent["appointment"]:
#             rows = await conn.fetch(
#                 """
#                 SELECT a.id, a.date::text, a.time::text,
#                        a.status, a.appointment_status,
#                        u.name  AS dentist_name,
#                        p.email AS patient_email
#                 FROM   appointments a
#                 LEFT JOIN users    u ON u.id = a.dentist_id
#                 LEFT JOIN patients p ON p.id = a.patient_id
#                 WHERE  a.hospital_id = $1
#                   AND  a.deleted_at  IS NULL
#                   AND  a.date       >= CURRENT_DATE
#                 ORDER  BY a.date ASC, a.time ASC
#                 LIMIT  10
#                 """,
#                 hospital_id,
#             )
#             if rows:
#                 ctx["upcomingAppointments"] = [dict(r) for r in rows]

#         # ── Dentists ──
#         if intent["dentist"]:
#             rows = await conn.fetch(
#                 """
#                 SELECT name, role, email
#                 FROM   users
#                 WHERE  hospital_id = $1
#                   AND  role        = 'dentist'
#                   AND  deleted_at  IS NULL
#                 ORDER  BY name
#                 """,
#                 hospital_id,
#             )
#             if rows:
#                 ctx["dentists"] = [dict(r) for r in rows]

#         # ── Hospital info ──
#         if intent["hospital"]:
#             row = await conn.fetchrow(
#                 """
#                 SELECT name, address, license_number
#                 FROM   hospitals
#                 WHERE  id = $1 AND deleted_at IS NULL
#                 LIMIT  1
#                 """,
#                 hospital_id,
#             )
#             if row:
#                 ctx["hospitalInfo"] = dict(row)

#         # ── Recent patients (decrypt name from AES-256-GCM) ──
#         if intent["patient"]:
#             rows = await conn.fetch(
#                 """
#                 SELECT id::text, name_enc, email, address, created_at::text
#                 FROM   patients
#                 WHERE  hospital_id = $1 AND deleted_at IS NULL
#                 ORDER  BY created_at DESC
#                 LIMIT  10
#                 """,
#                 hospital_id,
#             )
#             ctx["recentPatients"] = [
#                 {
#                     "id": r["id"],
#                     "name": decrypt_field(r["name_enc"]) or "(encrypted)",
#                     "email": r["email"],
#                     "address": r["address"],
#                     "created_at": r["created_at"],
#                 }
#                 for r in rows
#             ]

#         # ── Medical records (high-level, decrypted) ──
#         if intent["medical"]:
#             rows = await conn.fetch(
#                 """
#                 SELECT mr.id::text,
#                        p.email AS patient_email,
#                        mr.diagnosis_enc,
#                        mr.treatment_enc,
#                        mr.notes_enc,
#                        mr.created_at::text
#                 FROM   medical_records mr
#                 LEFT JOIN patients p ON p.id = mr.patient_id
#                 WHERE  mr.hospital_id = $1 AND mr.deleted_at IS NULL
#                 ORDER  BY mr.created_at DESC
#                 LIMIT  5
#                 """,
#                 hospital_id,
#             )
#             ctx["recentMedicalRecords"] = [
#                 {
#                     "id": r["id"],
#                     "patient_email": r["patient_email"],
#                     "diagnosis": decrypt_field(r["diagnosis_enc"]),
#                     "treatment": decrypt_field(r["treatment_enc"]),
#                     "notes": decrypt_field(r["notes_enc"]),
#                     "created_at": r["created_at"],
#                 }
#                 for r in rows
#             ]

#         return ctx
#     finally:
#         await conn.close()


# async def get_hospital_name(hospital_id: str) -> str:
#     """Return the hospital's name or a default if not found."""
#     conn = await asyncpg.connect(DATABASE_URL, ssl="require")
#     try:
#         row = await conn.fetchrow(
#             "SELECT name FROM hospitals WHERE id = $1 AND deleted_at IS NULL LIMIT 1",
#             hospital_id,
#         )
#         return row["name"] if row else "Dental Workshop"
#     finally:
#         await conn.close()


# # ──────────────────────────────────────────
# # System prompt
# # ──────────────────────────────────────────
# def build_system_prompt(db_ctx: dict[str, Any], hospital_name: str) -> str:
#     has_data = bool(db_ctx)
#     db_section = (
#         f"## Live data from the database (hospital-scoped):\n```json\n{json.dumps(db_ctx, indent=2, default=str)}\n```"
#         if has_data
#         else "## No specific database records matched this query."
#     )

#     return f"""You are DentaBot, a strictly scoped AI assistant embedded in the {hospital_name} dental management system.

# ## YOUR ONLY ALLOWED TOPICS:
# You are ONLY permitted to answer questions related to:
# - Dental appointments and scheduling
# - Patients and their information
# - Dentists and clinic staff
# - Medical records, diagnoses, treatments, prescriptions
# - Dental procedures and oral health advice
# - Hospital / clinic information (address, hours, contact)
# - Billing and payments related to dental services

# ## STRICT OFF-TOPIC RULE:
# If the user asks about ANYTHING outside the above topics — including but not limited to:
# sports, politics, coding, cooking, entertainment, history, science, travel, jokes, poems,
# other medical fields unrelated to dentistry, or any general knowledge questions —
# you MUST refuse politely with this exact response:
# "I'm only able to assist with dental and clinic-related questions. Please ask me about appointments, patients, treatments, staff, or clinic information."
# Do NOT attempt to answer off-topic questions even partially.

# {db_section}

# ## RESPONSE RULES:
# - Use the database data above for factual, precise answers.
# - If the question is dental/clinic-related but not in the database, answer from your general dental knowledge.
# - Never invent appointment times, patient names, or billing figures not in the data.
# - Never reveal raw encrypted fields or internal UUIDs.
# - Be concise (2-4 sentences), warm, and professional.
# - For clinical decisions, always recommend consulting the treating dentist.
# - Respond in the same language the user writes in.
# """


# # ──────────────────────────────────────────
# # Request / Response models
# # ──────────────────────────────────────────
# class HistoryItem(BaseModel):
#     role: str       # "user" | "assistant"
#     content: str


# class ChatRequest(BaseModel):
#     message: str
#     hospital_id: str
#     conversation_history: list[HistoryItem] = []


# class ChatResponse(BaseModel):
#     reply: str
#     db_tables_used: list[str]


# # ──────────────────────────────────────────
# # Routes
# # ──────────────────────────────────────────
# @app.get("/api/health")
# async def health():
#     return {"ok": True, "service": "dentabot-python"}


# @app.post("/api/chat", response_model=ChatResponse)
# async def chat(req: ChatRequest):
#     if not req.message.strip():
#         raise HTTPException(status_code=400, detail="message is required")

#     # 1. Fetch hospital name
#     hospital_name = await get_hospital_name(req.hospital_id)

#     # 2. Fetch DB context (now per‑request)
#     db_ctx = await fetch_db_context(req.message.strip(), req.hospital_id)

#     # 3. System prompt
#     system_prompt = build_system_prompt(db_ctx, hospital_name)

#     # 4. Build Gemini chat history
#     history = [
#         {
#             "role": "model" if m.role == "assistant" else "user",
#             "parts": [{"text": m.content}],
#         }
#         for m in req.conversation_history[-10:]
#     ]

#     # 5. Call Gemini
#     try:
#         model = genai.GenerativeModel(
#             model_name="gemini-2.5-flash",
#             system_instruction=system_prompt,
#         )
#         chat_session = model.start_chat(history=history)
#         result = chat_session.send_message(req.message.strip())
#         reply = result.text
#     except Exception as exc:
#         log.error("Gemini error: %s", exc)
#         raise HTTPException(status_code=502, detail="AI service error") from exc

#     return ChatResponse(reply=reply, db_tables_used=list(db_ctx.keys()))











































"""
DentaBot – Python FastAPI Chatbot Microservice (Vercel serverless edition)
=========================================================================
Runs as a Vercel serverless function at /api/chat/index.py

Key improvements over v1:
  ✦ Smart greeting detection with time-aware welcome messages
  ✦ Richer, more structured responses using light markdown
  ✦ Dashboard/overview intent — pulls stats summary automatically
  ✦ Billing intent — surfaces unpaid appointments
  ✦ Better system prompt that produces natural, helpful replies
  ✦ Hospital name + DB context fetched in a single connection
  ✦ Farewell detection — polite sign-off responses
"""

import os
import re
import json
import base64
import logging
from datetime import datetime, timezone
from typing import Any

import asyncpg
import google.generativeai as genai
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

# ──────────────────────────────────────────
# Logging
# ──────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")
log = logging.getLogger("dentabot")

# ──────────────────────────────────────────
# Config
# ──────────────────────────────────────────
DATABASE_URL: str = os.environ["DATABASE_URL"]
GEMINI_API_KEY: str = os.environ["GEMINI_API_KEY"]
ENC_KEY_B64: str = os.environ["MEDICAL_RECORD_ENC_KEY_B64"]
ALLOWED_ORIGINS: list[str] = os.getenv(
    "CORS_ORIGIN", "http://localhost:3000,http://localhost:4000"
).split(",")

genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="DentaBot", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────
# Crypto  (matches Node backend AES-256-GCM)
# ──────────────────────────────────────────
def _dec_key() -> bytes:
    key = base64.b64decode(ENC_KEY_B64)
    if len(key) != 32:
        raise ValueError("MEDICAL_RECORD_ENC_KEY_B64 must decode to 32 bytes")
    return key


def decrypt_field(b64_packed: str | None) -> str | None:
    if not b64_packed:
        return None
    try:
        payload = json.loads(base64.b64decode(b64_packed).decode())
        iv   = base64.b64decode(payload["iv_b64"])
        tag  = base64.b64decode(payload["tag_b64"])
        data = base64.b64decode(payload["data_b64"])
        plaintext = AESGCM(_dec_key()).decrypt(iv, data + tag, None)
        return plaintext.decode()
    except Exception as exc:
        log.warning("decrypt_field failed: %s", exc)
        return None


# ──────────────────────────────────────────
# Greeting & farewell detection
# ──────────────────────────────────────────
_GREETING_RE = re.compile(
    r"^\s*(hi+|hello+|hey+|howdy|good\s*(morning|afternoon|evening|day|night)|"
    r"greetings?|what'?s?\s*up|namaste|namaskar|yo+|hola|sup)\W*$",
    re.I,
)
_FAREWELL_RE = re.compile(
    r"^\s*(bye+|goodbye+|good\s*bye|see\s*you|take\s*care|later|ciao|"
    r"thank\s*you|thanks+|thx|cheers)\W*$",
    re.I,
)


def is_greeting(msg: str) -> bool:
    return bool(_GREETING_RE.match(msg.strip()))


def is_farewell(msg: str) -> bool:
    return bool(_FAREWELL_RE.match(msg.strip()))


def time_of_day() -> str:
    hour = datetime.now(timezone.utc).hour
    if 5 <= hour < 12:
        return "morning"
    if 12 <= hour < 17:
        return "afternoon"
    if 17 <= hour < 21:
        return "evening"
    return "night"


def build_greeting(hospital_name: str) -> str:
    tod = time_of_day()
    return (
        f"Good {tod}! 👋 Welcome to **{hospital_name}**.\n\n"
        "I'm **DentaBot**, your dental clinic assistant. I can help you with:\n"
        "- 🗓 **Appointments** — upcoming, scheduled, or past visits\n"
        "- 🧑‍⚕️ **Patients** — records, history, and contact details\n"
        "- 👨‍⚕️ **Dentists & Staff** — who's available and their specializations\n"
        "- 🏥 **Clinic Info** — address, hours, and contact\n"
        "- 💳 **Billing** — invoices and payment status\n"
        "- 🦷 **Dental Knowledge** — procedures, treatments, and oral health tips\n\n"
        "How can I assist you today?"
    )


def build_farewell(hospital_name: str) -> str:
    return (
        f"You're welcome! 😊 Take care and have a wonderful {time_of_day()}.\n\n"
        f"If you need anything else from **{hospital_name}**, I'm always here. "
        "Stay healthy and keep smiling! 🦷✨"
    )


# ──────────────────────────────────────────
# Intent detection
# ──────────────────────────────────────────
_INTENTS: dict[str, re.Pattern] = {
    "appointment": re.compile(
        r"appointment|book|schedule|slot|available|when|timing|visit|today.*appoint|"
        r"upcoming|confirm|reschedule|cancel.*appoint",
        re.I,
    ),
    "patient": re.compile(
        r"patient|find patient|who is|lookup|search.*patient|patient.*list|"
        r"registered|new patient",
        re.I,
    ),
    "medical": re.compile(
        r"diagnosis|diagnos|treatment|prescription|medical record|record|"
        r"history|procedure|medication|drug|symptoms",
        re.I,
    ),
    "dentist": re.compile(
        r"doctor|dentist|dr\.|staff|specialist|who treat|assigned|surgeon|"
        r"hygienist|orthodontist",
        re.I,
    ),
    "hospital": re.compile(
        r"hospital|clinic|address|contact|location|hours|open|close|"
        r"phone|email|website|directions",
        re.I,
    ),
    "billing": re.compile(
        r"billing|bill|cost|fee|charge|paid|unpaid|invoice|price|"
        r"payment|outstanding|balance|receipt",
        re.I,
    ),
    "dashboard": re.compile(
        r"overview|summary|stats|statistics|dashboard|report|total|"
        r"how many|count|numbers|performance",
        re.I,
    ),
}


def detect_intent(msg: str) -> dict[str, bool]:
    return {k: bool(p.search(msg)) for k, p in _INTENTS.items()}


# ──────────────────────────────────────────
# DB fetcher  (single connection per request)
# ──────────────────────────────────────────
async def fetch_all_context(
    message: str, hospital_id: str
) -> tuple[str, dict[str, Any]]:
    """
    Open one DB connection, fetch hospital name + all intent-driven data,
    close the connection. Returns (hospital_name, context_dict).
    """
    intent = detect_intent(message)
    ctx: dict[str, Any] = {}
    hospital_name = "Dental Workshop"

    conn = await asyncpg.connect(DATABASE_URL, ssl="require")
    try:
        # ── Hospital name (always needed) ──────────────────────────────
        row = await conn.fetchrow(
            "SELECT name, address FROM hospitals WHERE id=$1 AND deleted_at IS NULL LIMIT 1",
            hospital_id,
        )
        if row:
            hospital_name = row["name"]
            # Put hospital info in ctx if hospital intent OR dashboard
            if intent["hospital"] or intent["dashboard"]:
                ctx["hospitalInfo"] = {"name": row["name"], "address": row["address"]}

        # ── Appointment stats (always run — cheap, always useful) ──────
        stat_rows = await conn.fetch(
            """
            SELECT status, COUNT(*)::int AS count
            FROM   appointments
            WHERE  hospital_id = $1 AND deleted_at IS NULL
            GROUP  BY status
            """,
            hospital_id,
        )
        if stat_rows:
            ctx["appointmentStats"] = [dict(r) for r in stat_rows]

        # ── Dashboard / overview ───────────────────────────────────────
        if intent["dashboard"]:
            # Total patients
            p_row = await conn.fetchrow(
                "SELECT COUNT(*)::int AS total FROM patients WHERE hospital_id=$1 AND deleted_at IS NULL",
                hospital_id,
            )
            if p_row:
                ctx["totalPatients"] = p_row["total"]

            # Total dentists
            d_row = await conn.fetchrow(
                "SELECT COUNT(*)::int AS total FROM users WHERE hospital_id=$1 AND role='dentist' AND deleted_at IS NULL",
                hospital_id,
            )
            if d_row:
                ctx["totalDentists"] = d_row["total"]

            # Upcoming appointments count
            u_row = await conn.fetchrow(
                "SELECT COUNT(*)::int AS total FROM appointments WHERE hospital_id=$1 AND date>=CURRENT_DATE AND deleted_at IS NULL",
                hospital_id,
            )
            if u_row:
                ctx["upcomingAppointmentsCount"] = u_row["total"]

            # Unpaid billing count
            bill_row = await conn.fetchrow(
                """
                SELECT COUNT(*)::int AS total FROM appointments
                WHERE  hospital_id=$1
                  AND  deleted_at IS NULL
                  AND  (billing_summary->>'paid')::boolean = false
                """,
                hospital_id,
            )
            if bill_row:
                ctx["unpaidBillingCount"] = bill_row["total"]

        # ── Upcoming appointments ──────────────────────────────────────
        if intent["appointment"]:
            rows = await conn.fetch(
                """
                SELECT a.date::text, a.time::text,
                       a.status, a.appointment_status,
                       u.name  AS dentist_name,
                       p.email AS patient_email,
                       a.billing_summary
                FROM   appointments a
                LEFT JOIN users    u ON u.id = a.dentist_id
                LEFT JOIN patients p ON p.id = a.patient_id
                WHERE  a.hospital_id = $1
                  AND  a.deleted_at  IS NULL
                  AND  a.date       >= CURRENT_DATE
                ORDER  BY a.date ASC, a.time ASC
                LIMIT  10
                """,
                hospital_id,
            )
            if rows:
                ctx["upcomingAppointments"] = [dict(r) for r in rows]

        # ── Billing — unpaid appointments ──────────────────────────────
        if intent["billing"]:
            rows = await conn.fetch(
                """
                SELECT a.date::text, a.time::text,
                       u.name  AS dentist_name,
                       p.email AS patient_email,
                       a.billing_summary
                FROM   appointments a
                LEFT JOIN users    u ON u.id = a.dentist_id
                LEFT JOIN patients p ON p.id = a.patient_id
                WHERE  a.hospital_id = $1
                  AND  a.deleted_at  IS NULL
                  AND  a.billing_summary IS NOT NULL
                  AND  (a.billing_summary->>'paid')::boolean = false
                ORDER  BY a.date DESC
                LIMIT  10
                """,
                hospital_id,
            )
            if rows:
                ctx["unpaidBilling"] = [dict(r) for r in rows]

        # ── Dentists ───────────────────────────────────────────────────
        if intent["dentist"] or intent["dashboard"]:
            rows = await conn.fetch(
                """
                SELECT name, email
                FROM   users
                WHERE  hospital_id=$1 AND role='dentist' AND deleted_at IS NULL
                ORDER  BY name
                """,
                hospital_id,
            )
            if rows:
                ctx["dentists"] = [dict(r) for r in rows]

        # ── Patients ───────────────────────────────────────────────────
        if intent["patient"]:
            rows = await conn.fetch(
                """
                SELECT id::text, name_enc, email, address, created_at::text
                FROM   patients
                WHERE  hospital_id=$1 AND deleted_at IS NULL
                ORDER  BY created_at DESC
                LIMIT  10
                """,
                hospital_id,
            )
            ctx["recentPatients"] = [
                {
                    "id"        : r["id"],
                    "name"      : decrypt_field(r["name_enc"]) or "(encrypted)",
                    "email"     : r["email"],
                    "address"   : r["address"],
                    "created_at": r["created_at"],
                }
                for r in rows
            ]

        # ── Medical records ────────────────────────────────────────────
        if intent["medical"]:
            rows = await conn.fetch(
                """
                SELECT mr.id::text,
                       p.email AS patient_email,
                       mr.diagnosis_enc,
                       mr.treatment_enc,
                       mr.notes_enc,
                       mr.prescription_enc,
                       mr.created_at::text
                FROM   medical_records mr
                LEFT JOIN patients p ON p.id = mr.patient_id
                WHERE  mr.hospital_id=$1 AND mr.deleted_at IS NULL
                ORDER  BY mr.created_at DESC
                LIMIT  5
                """,
                hospital_id,
            )
            ctx["recentMedicalRecords"] = [
                {
                    "id"            : r["id"],
                    "patient_email" : r["patient_email"],
                    "diagnosis"     : decrypt_field(r["diagnosis_enc"]),
                    "treatment"     : decrypt_field(r["treatment_enc"]),
                    "notes"         : decrypt_field(r["notes_enc"]),
                    "prescription"  : decrypt_field(r["prescription_enc"]),
                    "created_at"    : r["created_at"],
                }
                for r in rows
            ]

    finally:
        await conn.close()

    return hospital_name, ctx


# ──────────────────────────────────────────
# System prompt
# ──────────────────────────────────────────
def build_system_prompt(db_ctx: dict[str, Any], hospital_name: str) -> str:
    has_data = bool(db_ctx)
    tod      = time_of_day()

    db_section = (
        f"## Live clinic data (scoped to {hospital_name}):\n"
        f"```json\n{json.dumps(db_ctx, indent=2, default=str)}\n```"
        if has_data
        else "## No specific database records matched this query."
    )

    return f"""You are DentaBot, the AI assistant for **{hospital_name}** dental clinic.
Current time of day: {tod}

## YOUR ROLE
You assist clinic staff — admins, dentists, receptionists — with everything related to the clinic.
You are knowledgeable, warm, and efficient. You speak like a helpful colleague, not a machine.

## ALLOWED TOPICS ONLY
You ONLY answer questions about:
- Dental appointments and scheduling
- Patients and their records
- Dentists and clinic staff
- Medical records, diagnoses, treatments, prescriptions
- Dental procedures and oral health advice
- Hospital / clinic information (address, hours, contact, billing)

## OFF-TOPIC RULE
If asked about anything outside dental/clinic topics (sports, coding, politics, entertainment, general science, etc.) respond ONLY with:
"I'm here to help with dental clinic matters only. Try asking me about appointments, patients, or dental procedures! 🦷"

{db_section}

## HOW TO RESPOND
1. **Use the database data above** for specific factual answers — dates, names, statuses, billing amounts.
2. **If data is not in the database**, answer from your general dental knowledge.
3. **Never invent** appointment times, patient names, or billing figures not present in the data.
4. **Format responses clearly** — use bullet points for lists, bold for key terms, line breaks between sections. Keep it readable.
5. **Be concise** — 2 to 5 sentences for simple questions, structured lists for complex ones.
6. **Be warm and professional** — you're a helpful colleague, not a formal chatbot.
7. **For clinical decisions**, always add: "Please consult the treating dentist for confirmation."
8. **Never reveal** raw encrypted fields, internal UUIDs, or base64 strings.
9. **Respond in the same language** the user writes in.

## RESPONSE STYLE EXAMPLES
- For appointment queries → list with date, time, patient, dentist, status
- For billing queries → list unpaid items with amounts
- For dental knowledge → explain clearly with a practical tip at the end
- For overviews/stats → use a brief summary with key numbers highlighted
"""


# ──────────────────────────────────────────
# Request / Response models
# ──────────────────────────────────────────
class HistoryItem(BaseModel):
    role: str       # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    hospital_id: str
    conversation_history: list[HistoryItem] = []


class ChatResponse(BaseModel):
    reply: str
    db_tables_used: list[str]


# ──────────────────────────────────────────
# Routes
# ──────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"ok": True, "service": "dentabot-python", "version": "2.0.0"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    msg = req.message.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="message is required")

    # ── 1. Fetch hospital name + DB context (single connection) ──────
    try:
        hospital_name, db_ctx = await fetch_all_context(msg, req.hospital_id)
    except Exception as exc:
        log.error("DB error: %s", exc)
        hospital_name = "Dental Workshop"
        db_ctx        = {}

    # ── 2. Handle greetings locally — no LLM call needed ────────────
    if is_greeting(msg) and len(req.conversation_history) == 0:
        return ChatResponse(
            reply=build_greeting(hospital_name),
            db_tables_used=[],
        )

    # ── 3. Handle farewells locally ───────────────────────────────────
    if is_farewell(msg):
        return ChatResponse(
            reply=build_farewell(hospital_name),
            db_tables_used=[],
        )

    # ── 4. Build system prompt ────────────────────────────────────────
    system_prompt = build_system_prompt(db_ctx, hospital_name)

    # ── 5. Build Gemini history (role: "user" | "model") ─────────────
    history = [
        {
            "role"  : "model" if m.role == "assistant" else "user",
            "parts" : [{"text": m.content}],
        }
        for m in req.conversation_history[-10:]
    ]

    # ── 6. Call Gemini ────────────────────────────────────────────────
    try:
        model = genai.GenerativeModel(
            model_name        ="gemini-2.5-flash",
            system_instruction=system_prompt,
        )
        chat_session = model.start_chat(history=history)
        result       = chat_session.send_message(msg)
        reply        = result.text
    except Exception as exc:
        log.error("Gemini error: %s", exc)
        raise HTTPException(status_code=502, detail="AI service error") from exc

    return ChatResponse(reply=reply, db_tables_used=list(db_ctx.keys()))
