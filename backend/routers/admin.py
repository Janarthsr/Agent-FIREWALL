"""Admin, Milestones, Matching, Escrow, Rewards, Reviews, and Disputes routers."""
try:
    from fastapi import APIRouter
except ImportError:
    APIRouter = lambda *args, **kwargs: None

router = APIRouter() if APIRouter else None
