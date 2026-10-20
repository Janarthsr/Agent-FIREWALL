"""Disputes router."""
try:
    from fastapi import APIRouter
except ImportError:
    APIRouter = lambda *args, **kwargs: None

router = APIRouter() if APIRouter else None
