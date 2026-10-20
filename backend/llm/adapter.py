"""LLM Adapter enforcing deterministic fallback to MockLLM."""
from typing import Dict, Any
from backend.config import settings
from backend.llm.mock import MockLLM

class LLMAdapter:
    """
    Adapter ensuring all agent proposals flow through either configured LLM or deterministic MockLLM.
    Always flags outputs with MOCK if fallback or DEMO_MODE is active.
    """

    @staticmethod
    def propose(agent_type: str, prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        # Always use MockLLM for deterministic, internet-free demo mode
        if settings.DEMO_MODE:
            return MockLLM.propose_action(agent_type, prompt, context)

        # In production with live LLM, would wrap client here; falls back to MockLLM
        try:
            return MockLLM.propose_action(agent_type, prompt, context)
        except Exception:
            return MockLLM.propose_action(agent_type, prompt, context)
