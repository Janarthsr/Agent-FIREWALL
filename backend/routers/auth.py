"""Authentication router."""
try:
    from fastapi import APIRouter, HTTPException, Depends
except ImportError:
    APIRouter = lambda *args, **kwargs: None

from backend.db import get_db_connection
from backend.security import verify_password, create_access_token, hash_password
from backend.models import LoginRequest, LoginResponse, UserPublic
from backend.services.ledger_service import LedgerService
import uuid
import time

router = APIRouter() if APIRouter else None

def login_user(email: str, password: str):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cur.fetchone()
        if not user or not verify_password(password, user["password_hash"]):
            return None
        return dict(user)
    finally:
        conn.close()

if router:
    @router.post("/login")
    def login(req: LoginRequest):
        user = login_user(req.email, req.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token = create_access_token({"sub": user["id"], "role": user["role"], "email": user["email"]})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        }
