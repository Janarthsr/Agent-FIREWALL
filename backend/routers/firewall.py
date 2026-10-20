"""Firewall evaluation router."""
try:
    from fastapi import APIRouter
except ImportError:
    APIRouter = lambda *args, **kwargs: None

from backend.services.firewall_service import FirewallService
from backend.models import FirewallRequest

router = APIRouter() if APIRouter else None

if router:
    @router.post("/evaluate")
    def evaluate(req: FirewallRequest):
        return FirewallService.evaluate(
            agent_id=req.agent_id,
            tool=req.tool,
            args=req.args,
            project_id=req.project_id,
            data_labels=req.data_labels,
            origin_content_ids=req.origin_content_ids,
            human_owner_id=req.human_owner_id,
            destination=req.destination,
            is_cloud_model=req.is_cloud_model,
            content_payload=req.content_payload
        )
