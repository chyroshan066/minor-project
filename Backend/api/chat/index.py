"""
DentaBot – Python FastAPI Chatbot Microservice (Vercel serverless edition)
=========================================================================
Runs as a Vercel serverless function. All database connections are per‑request.
"""

import os
import re
import json
import base64
import logging
from typing import Any

import asyncpg
import google.generativeai as genai
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables (Vercel injects them automatically, but local dev)
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

app = FastAPI(title="DentaBot", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────
# Crypto – matches Node backend exactly
# (AES-256-GCM, same key and pack format)
# ──────────────────────────────────────────
def _dec_key() -> bytes:
    key = base64.b64decode(ENC_KEY_B64)
    if len(key) != 32:
        raise ValueError("MEDICAL_RECORD_ENC_KEY_B64 must decode to 32 bytes")
    return key


def decrypt_field(b64_packed: str | None) -> str | None:
    """Decrypt a field encrypted by the Node crypto.js encryptField()."""
    if not b64_packed:
        return None
    try:
        payload = json.loads(base64.b64decode(b64_packed).decode())
        iv = base64.b64decode(payload["iv_b64"])
        tag = base64.b64decode(payload["tag_b64"])
        data = base64.b64decode(payload["data_b64"])
        aesgcm = AESGCM(_dec_key())
        # GCM ciphertext = data || tag  (cryptography lib expects them joined)
        plaintext = aesgcm.decrypt(iv, data + tag, None)
        return plaintext.decode()
    except Exception as exc:
        log.warning("decrypt_field failed: %s", exc)
        return None


# ──────────────────────────────────────────
# Intent detection
# ──────────────────────────────────────────
_INTENTS = {
    "appointment": re.compile(
        r"appointment|book|schedule|slot|available|when|timing|visit", re.I
    ),
    "patient": re.compile(r"patient|record|history|who is|find patient", re.I),
    "medical": re.compile(
        r"diagnosis|treatment|prescription|record|medical", re.I
    ),
    "dentist": re.compile(
        r"doctor|dentist|dr\.|staff|specialist|who treat", re.I
    ),
    "hospital": re.compile(
        r"hospital|clinic|address|contact|location|hours|open|close", re.I
    ),
    "billing": re.compile(
        r"billing|cost|fee|charge|paid|invoice|price", re.I
    ),
}


def detect_intent(msg: str) -> dict[str, bool]:
    return {k: bool(p.search(msg)) for k, p in _INTENTS.items()}


# ──────────────────────────────────────────
# DB context fetcher (hospital-scoped) – per‑request connection
# ──────────────────────────────────────────
async def fetch_db_context(message: str, hospital_id: str) -> dict[str, Any]:
    """
    Connect to the database, run queries based on intent,
    and return a context dictionary for the AI.
    """
    intent = detect_intent(message)
    ctx: dict[str, Any] = {}

    # Open a new connection
    conn = await asyncpg.connect(DATABASE_URL, ssl="require")
    try:
        # ── Appointment stats (always run – lightweight) ──
        rows = await conn.fetch(
            """
            SELECT status, COUNT(*)::int AS count
            FROM   appointments
            WHERE  hospital_id = $1 AND deleted_at IS NULL
            GROUP  BY status
            """,
            hospital_id,
        )
        if rows:
            ctx["appointmentStats"] = [dict(r) for r in rows]

        # ── Upcoming appointments ──
        if intent["appointment"]:
            rows = await conn.fetch(
                """
                SELECT a.id, a.date::text, a.time::text,
                       a.status, a.appointment_status,
                       u.name  AS dentist_name,
                       p.email AS patient_email
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

        # ── Dentists ──
        if intent["dentist"]:
            rows = await conn.fetch(
                """
                SELECT name, role, email
                FROM   users
                WHERE  hospital_id = $1
                  AND  role        = 'dentist'
                  AND  deleted_at  IS NULL
                ORDER  BY name
                """,
                hospital_id,
            )
            if rows:
                ctx["dentists"] = [dict(r) for r in rows]

        # ── Hospital info ──
        if intent["hospital"]:
            row = await conn.fetchrow(
                """
                SELECT name, address, license_number
                FROM   hospitals
                WHERE  id = $1 AND deleted_at IS NULL
                LIMIT  1
                """,
                hospital_id,
            )
            if row:
                ctx["hospitalInfo"] = dict(row)

        # ── Recent patients (decrypt name from AES-256-GCM) ──
        if intent["patient"]:
            rows = await conn.fetch(
                """
                SELECT id::text, name_enc, email, address, created_at::text
                FROM   patients
                WHERE  hospital_id = $1 AND deleted_at IS NULL
                ORDER  BY created_at DESC
                LIMIT  10
                """,
                hospital_id,
            )
            ctx["recentPatients"] = [
                {
                    "id": r["id"],
                    "name": decrypt_field(r["name_enc"]) or "(encrypted)",
                    "email": r["email"],
                    "address": r["address"],
                    "created_at": r["created_at"],
                }
                for r in rows
            ]

        # ── Medical records (high-level, decrypted) ──
        if intent["medical"]:
            rows = await conn.fetch(
                """
                SELECT mr.id::text,
                       p.email AS patient_email,
                       mr.diagnosis_enc,
                       mr.treatment_enc,
                       mr.notes_enc,
                       mr.created_at::text
                FROM   medical_records mr
                LEFT JOIN patients p ON p.id = mr.patient_id
                WHERE  mr.hospital_id = $1 AND mr.deleted_at IS NULL
                ORDER  BY mr.created_at DESC
                LIMIT  5
                """,
                hospital_id,
            )
            ctx["recentMedicalRecords"] = [
                {
                    "id": r["id"],
                    "patient_email": r["patient_email"],
                    "diagnosis": decrypt_field(r["diagnosis_enc"]),
                    "treatment": decrypt_field(r["treatment_enc"]),
                    "notes": decrypt_field(r["notes_enc"]),
                    "created_at": r["created_at"],
                }
                for r in rows
            ]

        return ctx
    finally:
        await conn.close()


async def get_hospital_name(hospital_id: str) -> str:
    """Return the hospital's name or a default if not found."""
    conn = await asyncpg.connect(DATABASE_URL, ssl="require")
    try:
        row = await conn.fetchrow(
            "SELECT name FROM hospitals WHERE id = $1 AND deleted_at IS NULL LIMIT 1",
            hospital_id,
        )
        return row["name"] if row else "Dental Workshop"
    finally:
        await conn.close()


# ──────────────────────────────────────────
# System prompt
# ──────────────────────────────────────────
def build_system_prompt(db_ctx: dict[str, Any], hospital_name: str) -> str:
    has_data = bool(db_ctx)
    db_section = (
        f"## Live data from the database (hospital-scoped):\n```json\n{json.dumps(db_ctx, indent=2, default=str)}\n```"
        if has_data
        else "## No specific database records matched this query."
    )

    return f"""You are DentaBot, a strictly scoped AI assistant embedded in the {hospital_name} dental management system.

## YOUR ONLY ALLOWED TOPICS:
You are ONLY permitted to answer questions related to:
- Dental appointments and scheduling
- Patients and their information
- Dentists and clinic staff
- Medical records, diagnoses, treatments, prescriptions
- Dental procedures and oral health advice
- Hospital / clinic information (address, hours, contact)
- Billing and payments related to dental services

## STRICT OFF-TOPIC RULE:
If the user asks about ANYTHING outside the above topics — including but not limited to:
sports, politics, coding, cooking, entertainment, history, science, travel, jokes, poems,
other medical fields unrelated to dentistry, or any general knowledge questions —
you MUST refuse politely with this exact response:
"I'm only able to assist with dental and clinic-related questions. Please ask me about appointments, patients, treatments, staff, or clinic information."
Do NOT attempt to answer off-topic questions even partially.

{db_section}

## RESPONSE RULES:
- Use the database data above for factual, precise answers.
- If the question is dental/clinic-related but not in the database, answer from your general dental knowledge.
- Never invent appointment times, patient names, or billing figures not in the data.
- Never reveal raw encrypted fields or internal UUIDs.
- Be concise (2-4 sentences), warm, and professional.
- For clinical decisions, always recommend consulting the treating dentist.
- Respond in the same language the user writes in.
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
    return {"ok": True, "service": "dentabot-python"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="message is required")

    # 1. Fetch hospital name
    hospital_name = await get_hospital_name(req.hospital_id)

    # 2. Fetch DB context (now per‑request)
    db_ctx = await fetch_db_context(req.message.strip(), req.hospital_id)

    # 3. System prompt
    system_prompt = build_system_prompt(db_ctx, hospital_name)

    # 4. Build Gemini chat history
    history = [
        {
            "role": "model" if m.role == "assistant" else "user",
            "parts": [{"text": m.content}],
        }
        for m in req.conversation_history[-10:]
    ]

    # 5. Call Gemini
    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_prompt,
        )
        chat_session = model.start_chat(history=history)
        result = chat_session.send_message(req.message.strip())
        reply = result.text
    except Exception as exc:
        log.error("Gemini error: %s", exc)
        raise HTTPException(status_code=502, detail="AI service error") from exc

    return ChatResponse(reply=reply, db_tables_used=list(db_ctx.keys()))

