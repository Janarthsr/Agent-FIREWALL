"""API Request and Response schemas."""
from typing import Optional, List, Dict, Any

try:
    from pydantic import BaseModel
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__

class CharterAcceptRequest(BaseModel):
    model_ack: bool = True

class MilestoneProposeRequest(BaseModel):
    project_id: str

class SubmissionCreateRequest(BaseModel):
    milestone_id: str
    file_name: str
    file_content: str
    ai_use_pct: float = 0.0

class ReviewSubmitRequest(BaseModel):
    submission_id: str
    decision: str  # ACCEPT or REJECT
    feedback: str
    score: int = 85

class DisputeCreateRequest(BaseModel):
    project_id: str
    target_type: str  # CONTRIBUTION, PAYOUT, CREDENTIAL
    target_id: str
    reason: str

class DisputeResolveRequest(BaseModel):
    resolution: str

class SimulatorRequest(BaseModel):
    same_project: bool = True
    data_label: str = "CONFIDENTIAL"  # PUBLIC or CONFIDENTIAL
    destination: str = "EXTERNAL"     # INTERNAL or EXTERNAL
    injection_signal: bool = True
    tool: str = "send_email"
    content_sample: str = ""
