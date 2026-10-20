"""FastAPI entry point for Agent Firewall."""
try:
    from fastapi import FastAPI, Depends, HTTPException, status
    from fastapi.middleware.cors import CORSMiddleware
except ImportError:
    FastAPI = None

from backend.config import settings

def create_app():
    if FastAPI is None:
        return None
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        description="Deterministic trust infrastructure for human + AI collaboration. The LLM may propose. Code decides."
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from backend.routers import (
        auth, projects, charters, milestones, matching,
        workspace, firewall, ledger, escrow, rewards,
        reviews, disputes, admin, demo
    )

    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
    app.include_router(charters.router, prefix="/api/charters", tags=["charters"])
    app.include_router(milestones.router, prefix="/api/milestones", tags=["milestones"])
    app.include_router(matching.router, prefix="/api/matching", tags=["matching"])
    app.include_router(workspace.router, prefix="/api/workspace", tags=["workspace"])
    app.include_router(firewall.router, prefix="/api/firewall", tags=["firewall"])
    app.include_router(ledger.router, prefix="/api/ledger", tags=["ledger"])
    app.include_router(escrow.router, prefix="/api/escrow", tags=["escrow"])
    app.include_router(rewards.router, prefix="/api/rewards", tags=["rewards"])
    app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
    app.include_router(disputes.router, prefix="/api/disputes", tags=["disputes"])
    app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
    app.include_router(demo.router, prefix="/api/demo", tags=["demo"])

    @app.get("/api/health")
    def health():
        return {
            "status": "HEALTHY",
            "app": settings.APP_NAME,
            "version": settings.VERSION,
            "demo_mode": settings.DEMO_MODE
        }

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    if app:
        uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
