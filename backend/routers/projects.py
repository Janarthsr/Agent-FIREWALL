"""Projects router."""
try:
    from fastapi import APIRouter, HTTPException, Request
except ImportError:
    APIRouter = lambda *args, **kwargs: None

from backend.db import get_db_connection
from backend.services.ledger_service import LedgerService
import uuid
import time

router = APIRouter() if APIRouter else None

def get_all_projects():
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM projects ORDER BY created_at DESC")
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()

def get_project_by_id(pid: str):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM projects WHERE id = ?", (pid,))
        r = cur.fetchone()
        return dict(r) if r else None
    finally:
        conn.close()

if router:
    @router.get("")
    def list_projects():
        return get_all_projects()

    @router.get("/{id}")
    def get_project(id: str):
        p = get_project_by_id(id)
        if not p:
            raise HTTPException(status_code=404, detail="Project not found")
        return p
