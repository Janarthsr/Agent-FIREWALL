"""Ledger router."""
try:
    from fastapi import APIRouter
except ImportError:
    APIRouter = lambda *args, **kwargs: None

from backend.services.ledger_service import LedgerService

router = APIRouter() if APIRouter else None

if router:
    @router.get("")
    def get_ledger(project_id: str = None, actor_id: str = None, action: str = None, limit: int = 100):
        return LedgerService.get_entries(project_id, actor_id, action, limit)

    @router.get("/verify")
    def verify_ledger():
        return LedgerService.verify()

    @router.get("/head")
    def get_head():
        last = LedgerService.get_last_entry()
        return {"head_hash": last["current_hash"] if last else "0" * 64}
