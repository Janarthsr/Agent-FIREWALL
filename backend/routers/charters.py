"""Charters router."""
try:
    from fastapi import APIRouter, HTTPException
except ImportError:
    APIRouter = lambda *args, **kwargs: None

from backend.db import get_db_connection
from backend.services.ledger_service import LedgerService
import uuid
import time

router = APIRouter() if APIRouter else None

def get_charter_for_project(project_id: str):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM charters WHERE project_id = ? ORDER BY version DESC LIMIT 1", (project_id,))
        r = cur.fetchone()
        return dict(r) if r else None
    finally:
        conn.close()

def accept_charter_terms(charter_id: str, user_id: str, project_id: str, version: str, model_ack: bool):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        ack_id = f"ack_{uuid.uuid4().hex[:10]}"
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        cur.execute("""
        INSERT INTO charter_acceptances (id, user_id, charter_id, project_id, version, model_ack, accepted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (ack_id, user_id, charter_id, project_id, version, 1 if model_ack else 0, now))
        conn.commit()
    finally:
        conn.close()

    LedgerService.append(
        actor_type="USER",
        actor_id=user_id,
        human_owner_id=user_id,
        project_id=project_id,
        action="CHARTER_ACCEPTED",
        decision="ALLOW",
        reason=f"User accepted Charter v{version} and acknowledged engagement model terms",
        payload={"charter_id": charter_id, "version": version, "model_ack": model_ack}
    )
    return {"status": "ACCEPTED", "version": version, "user_id": user_id}
