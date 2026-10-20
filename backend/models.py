"""Data schemas and constants for Agent Firewall."""
from typing import Optional, List, Dict, Any

try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__
    def Field(default=None, default_factory=None):
        if default_factory:
            return default_factory()
        return default

# Constants & Enums
class Role:
    STUDENT = "student"
    EXPERT = "expert"
    SPONSOR = "sponsor"
    ADMIN = "admin"

class EngagementModel:
    FUNDED = "FUNDED"
    STIPEND = "STIPEND"
    KNOWLEDGE = "KNOWLEDGE"
    INSTITUTIONAL = "INSTITUTIONAL"

class FirewallDecision:
    ALLOW = "ALLOW"
    APPROVAL = "APPROVAL"
    BLOCK = "BLOCK"

class CheckStatus:
    PASS = "PASS"
    FAIL = "FAIL"

class LedgerAction:
    USER_REGISTERED = "USER_REGISTERED"
    PROJECT_POSTED = "PROJECT_POSTED"
    CHARTER_PUBLISHED = "CHARTER_PUBLISHED"
    CHARTER_ACCEPTED = "CHARTER_ACCEPTED"
    CHARTER_VERSION_CHANGED = "CHARTER_VERSION_CHANGED"
    MILESTONES_PROPOSED = "MILESTONES_PROPOSED"
    MILESTONES_ACCEPTED = "MILESTONES_ACCEPTED"
    MATCH_COMPUTED = "MATCH_COMPUTED"
    COI_FILTERED = "COI_FILTERED"
    BRIEF_ACCESS_ALLOWED = "BRIEF_ACCESS_ALLOWED"
    BRIEF_ACCESS_DENIED = "BRIEF_ACCESS_DENIED"
    ESCROW_FUNDED = "ESCROW_FUNDED"
    AGENT_TOOL_REQUEST = "AGENT_TOOL_REQUEST"
    APPROVAL_GRANTED = "APPROVAL_GRANTED"
    APPROVAL_DENIED = "APPROVAL_DENIED"
    SUBMISSION_CREATED = "SUBMISSION_CREATED"
    SIMILARITY_FLAGGED = "SIMILARITY_FLAGGED"
    REVIEW_SUBMITTED = "REVIEW_SUBMITTED"
    WORK_ACCEPTED = "WORK_ACCEPTED"
    WORK_REJECTED = "WORK_REJECTED"
    PAYOUT_RELEASED = "PAYOUT_RELEASED"
    CREDIT_POOL_SET = "CREDIT_POOL_SET"
    CREDIT_ISSUED = "CREDIT_ISSUED"
    CREDENTIAL_ISSUED = "CREDENTIAL_ISSUED"
    CREDENTIAL_REVOKED = "CREDENTIAL_REVOKED"
    DISPUTE_OPENED = "DISPUTE_OPENED"
    DISPUTE_RESOLVED = "DISPUTE_RESOLVED"
    CORRECTION = "CORRECTION"
    SIMULATION = "SIMULATION"

# Schemas
class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    role: str

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic

class ProjectCreate(BaseModel):
    title: str
    public_summary: str
    confidential_brief: str
    sensitivity: str = "CONFIDENTIAL"
    engagement_model: str
    budget_inr: int = 0
    credit_pool_cu: int = 0
    charter_text: Optional[str] = None
    acceptance_criteria: Optional[str] = None

class FirewallRequest(BaseModel):
    agent_id: str
    tool: str
    args: Dict[str, Any] = Field(default_factory=dict)
    project_id: str
    data_labels: List[str] = Field(default_factory=list)
    origin_content_ids: List[str] = Field(default_factory=list)
    human_owner_id: Optional[str] = None
    destination: Optional[str] = "INTERNAL"
    is_cloud_model: bool = False
    content_payload: Optional[str] = ""

class CheckResult(BaseModel):
    scope: str
    sensitivity: str
    injection: str
    side_effect: str

class FirewallEvaluationResponse(BaseModel):
    receipt_id: str
    decision: str
    reason: str
    checks: CheckResult
    agent_id: str
    agent_name: str
    human_owner_id: str
    human_owner_name: str
    tool: str
    args_summary: str
    project_id: str
    timestamp: str
    ledger_entry_id: str
