"""Firewall, Ledger and Demo Routers."""
try:
    from fastapi import APIRouter, HTTPException, Depends
except ImportError:
    APIRouter = lambda *args, **kwargs: None

from backend.services.firewall_service import FirewallService
from backend.services.ledger_service import LedgerService
from backend.services.matching import MatchingService
from backend.services.scoping import ScopingService
from backend.services.escrow_mock import EscrowMockService
from backend.services.reward_engine import RewardEngine
from backend.services.credentials import CredentialService
from backend.db import get_db_connection

# Re-export services for convenience
__all__ = [
    "FirewallService", "LedgerService", "MatchingService", "ScopingService",
    "EscrowMockService", "RewardEngine", "CredentialService"
]
