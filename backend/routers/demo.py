"""Demo router providing fast-forward, reset, tamper and repair endpoints."""
try:
    from fastapi import APIRouter
except ImportError:
    APIRouter = lambda *args, **kwargs: None

from backend.db import get_db_connection
from backend.services.ledger_service import LedgerService
from seed.seed import seed_database

router = APIRouter() if APIRouter else None

def tamper_ledger_entry(entry_id: str):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE _firewall_system_flags SET value = '1' WHERE key = 'bypass_trigger';")
        cur.execute("UPDATE ledger_entries SET decision = 'TAMPERED_DENY' WHERE entry_id = ?", (entry_id,))
        cur.execute("UPDATE _firewall_system_flags SET value = '0' WHERE key = 'bypass_trigger';")
        conn.commit()
        return {"status": "TAMPERED", "entry_id": entry_id}
    finally:
        conn.close()

def repair_ledger():
    seed_database(clear_existing=True)
    return {"status": "REPAIRED", "message": "Demo state and cryptographic ledger restored."}

if router:
    @router.post("/reset")
    def reset():
        return repair_ledger()

    @router.post("/repair")
    def repair():
        return repair_ledger()

    @router.post("/tamper/{entry_id}")
    def tamper(entry_id: str):
        return tamper_ledger_entry(entry_id)
