"""Deterministic Firewall Engine for Agent Firewall."""
import re
import uuid
import time
from typing import Dict, Any, List, Optional
from backend.services.ledger_service import LedgerService
from backend.db import get_db_connection

SIDE_EFFECT_TOOLS = {
    "send_email",
    "export",
    "publish",
    "share_external",
    "release_funds",
    "issue_credit",
    "refund_escrow"
}

INJECTION_PATTERNS = [
    r"ignore\s+(?:all|previous|prior)\s+instructions",
    r"disregard\s+instructions",
    r"system\s+prompt",
    r"you\s+are\s+now",
    r"forward\s+this",
    r"send\s+this",
    r"send\s+the\s+(?:brief|document|data)",
    r"email\s+the\s+(?:full|confidential)",
    r"do\s+not\s+tell",
    r"[A-Za-z0-9+/]{40,}={0,2}", # base64 looking blob
    r"[\u200B-\u200D\uFEFF]",    # zero-width hidden characters
]

class FirewallService:
    @staticmethod
    def detect_injection(text: str) -> bool:
        if not text:
            return False
        lower_text = text.lower()
        for pattern in INJECTION_PATTERNS:
            if re.search(pattern, lower_text, re.IGNORECASE):
                return True
        return False

    @staticmethod
    def evaluate(
        agent_id: str,
        tool: str,
        args: Dict[str, Any],
        project_id: str,
        data_labels: List[str] = None,
        origin_content_ids: List[str] = None,
        human_owner_id: Optional[str] = None,
        destination: str = "INTERNAL",
        is_cloud_model: bool = False,
        content_payload: str = "",
        disable_injection_check: bool = False,
        is_simulation: bool = False
    ) -> Dict[str, Any]:
        """
        Evaluate tool request through deterministic 4-stage pipeline.
        Conceptual order:
        1. SCOPE
        2. SENSITIVITY
        3. INJECTION
        4. SIDE_EFFECT
        Decision priority: BLOCK > APPROVAL > ALLOW
        """
        data_labels = data_labels or []
        origin_content_ids = origin_content_ids or []
        args = args or {}

        # 0. Agent ownership check: No agent may run without a human owner
        if not human_owner_id or human_owner_id.strip() == "":
            receipt_id = f"rcpt_{uuid.uuid4().hex[:12]}"
            reason = "Agent without named human owner cannot run"
            ledger_entry = LedgerService.append(
                actor_type="AGENT",
                actor_id=agent_id,
                human_owner_id="UNKNOWN",
                project_id=project_id,
                action="AGENT_TOOL_REQUEST",
                decision="BLOCK",
                reason=reason,
                payload={"tool": tool, "args": args}
            )
            return {
                "receipt_id": receipt_id,
                "final_decision": "BLOCK",
                "reason": reason,
                "checks": {
                    "scope": "FAIL",
                    "sensitivity": "FAIL",
                    "injection": "PASS",
                    "side_effect": "FAIL"
                },
                "agent_id": agent_id,
                "agent_name": "Unowned Agent",
                "human_owner_id": "NONE",
                "human_owner_name": "No Owner",
                "tool": tool,
                "args_summary": str(args)[:100],
                "project_id": project_id,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "ledger_entry_id": ledger_entry["entry_id"]
            }

        # Resolve human owner and agent name
        agent_name = "Research Agent"
        human_owner_name = "Researcher"
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT name FROM users WHERE id = ?", (human_owner_id,))
            u = cur.fetchone()
            if u:
                human_owner_name = u["name"]

            cur.execute("SELECT name, project_id FROM agents WHERE id = ?", (agent_id,))
            ag = cur.fetchone()
            if ag:
                agent_name = ag["name"]
                agent_project_id = ag["project_id"]
            else:
                agent_project_id = project_id
        finally:
            conn.close()

        # Step 1: SCOPE check
        # If requested data or agent belongs to another project -> BLOCK
        scope_pass = True
        target_project_id = args.get("target_project_id", project_id)
        if target_project_id != project_id or agent_project_id != project_id:
            scope_pass = False

        # Step 2: SENSITIVITY check
        # If data is CONFIDENTIAL and (destination is EXTERNAL or cloud model) -> BLOCK
        sensitivity_pass = True
        is_confidential = "CONFIDENTIAL" in [d.upper() for d in data_labels] or args.get("is_confidential", False)
        is_external = destination.upper() == "EXTERNAL" or args.get("destination", "").upper() == "EXTERNAL"
        if is_confidential and (is_external or is_cloud_model):
            sensitivity_pass = False

        # Step 3: INJECTION check
        # Always evaluate injection dynamically from the current content payload and tool arguments
        injection_detected = False
        if not disable_injection_check:
            # Filter metadata flags so only actual text values are analyzed
            args_for_text = {k: v for k, v in args.items() if k not in ["target_project_id", "destination", "injection_signal", "is_confidential"]}
            args_text = json_to_text(args_for_text) if args_for_text else ""
            combined_text = f"{content_payload} {args_text}".strip()

            if combined_text:
                injection_detected = FirewallService.detect_injection(combined_text)
            else:
                injection_detected = bool(args.get("injection_signal", False))

        # Injection rule: If injection signal exists AND tool is a side-effect tool -> BLOCK
        injection_pass = True
        if injection_detected and tool in SIDE_EFFECT_TOOLS:
            injection_pass = False

        # Step 4: SIDE_EFFECT check
        # If tool is side-effect tool -> requires human APPROVAL
        side_effect_pass = True
        if tool in SIDE_EFFECT_TOOLS:
            side_effect_pass = False  # requires APPROVAL

        # Evaluate final decision & priority: BLOCK > APPROVAL > ALLOW
        final_decision = "ALLOW"
        reason = "All checks passed. Execution allowed."

        if not scope_pass:
            final_decision = "BLOCK"
            reason = "cross-project access violation"
        elif not sensitivity_pass:
            final_decision = "BLOCK"
            reason = "confidential data leaving: use local model"
        elif not injection_pass:
            final_decision = "BLOCK"
            reason = "injection + side effect detected"
        elif not side_effect_pass:
            final_decision = "APPROVAL"
            reason = f"Side-effect tool '{tool}' requires human owner authorization"

        receipt_id = f"rcpt_{uuid.uuid4().hex[:12]}"
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        args_summary = str(args)[:120]

        checks = {
            "scope": "PASS" if scope_pass else "FAIL",
            "sensitivity": "PASS" if sensitivity_pass else "FAIL",
            "injection": "PASS" if not injection_detected else "FAIL",
            "side_effect": "PASS" if side_effect_pass else "FAIL"
        }

        # Log into Ledger
        action_name = "SIMULATION" if is_simulation else "AGENT_TOOL_REQUEST"
        ledger_entry = LedgerService.append(
            actor_type="SIMULATOR" if is_simulation else "AGENT",
            actor_id=agent_id,
            human_owner_id=human_owner_id,
            project_id=project_id,
            action=action_name,
            decision=final_decision,
            reason=reason,
            payload={
                "tool": tool,
                "args": args,
                "checks": checks,
                "receipt_id": receipt_id
            }
        )

        receipt = {
            "receipt_id": receipt_id,
            "agent_id": agent_id,
            "agent_name": agent_name,
            "human_owner_id": human_owner_id,
            "human_owner_name": human_owner_name,
            "tool": tool,
            "args_summary": args_summary,
            "project_id": project_id,
            "timestamp": timestamp,
            "scope_check": checks["scope"],
            "sensitivity_check": checks["sensitivity"],
            "injection_check": checks["injection"],
            "side_effect_check": checks["side_effect"],
            "final_decision": final_decision,
            "reason": reason,
            "ledger_entry_id": ledger_entry["entry_id"]
        }

        # Save receipt and approvals to DB (if not simulation)
        if not is_simulation:
            conn = get_db_connection()
            try:
                cur = conn.cursor()
                cur.execute("""
                INSERT INTO firewall_receipts (
                    receipt_id, agent_id, agent_name, human_owner_id, human_owner_name,
                    tool, args_summary, project_id, timestamp, scope_check,
                    sensitivity_check, injection_check, side_effect_check,
                    final_decision, reason, ledger_entry_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    receipt["receipt_id"], receipt["agent_id"], receipt["agent_name"],
                    receipt["human_owner_id"], receipt["human_owner_name"],
                    receipt["tool"], receipt["args_summary"], receipt["project_id"],
                    receipt["timestamp"], receipt["scope_check"], receipt["sensitivity_check"],
                    receipt["injection_check"], receipt["side_effect_check"],
                    receipt["final_decision"], receipt["reason"], receipt["ledger_entry_id"]
                ))

                if final_decision == "APPROVAL":
                    approval_id = f"appr_{uuid.uuid4().hex[:12]}"
                    cur.execute("""
                    INSERT INTO approvals (
                        id, receipt_id, agent_id, human_owner_id, tool,
                        args_summary, project_id, status, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
                    """, (
                        approval_id, receipt_id, agent_id, human_owner_id,
                        tool, args_summary, project_id, timestamp
                    ))
                conn.commit()
            finally:
                conn.close()

        return {
            "receipt_id": receipt["receipt_id"],
            "final_decision": receipt["final_decision"],
            "reason": receipt["reason"],
            "scope_check": checks["scope"],
            "sensitivity_check": checks["sensitivity"],
            "injection_check": checks["injection"],
            "side_effect_check": checks["side_effect"],
            "checks": checks,
            "agent_id": receipt["agent_id"],
            "agent_name": receipt["agent_name"],
            "human_owner_id": receipt["human_owner_id"],
            "human_owner_name": receipt["human_owner_name"],
            "tool": receipt["tool"],
            "args_summary": receipt["args_summary"],
            "project_id": receipt["project_id"],
            "timestamp": receipt["timestamp"],
            "ledger_entry_id": receipt["ledger_entry_id"]
        }

def json_to_text(d: Any) -> str:
    if isinstance(d, dict):
        return " ".join([f"{k} {json_to_text(v)}" for k, v in d.items()])
    elif isinstance(d, list):
        return " ".join([json_to_text(x) for x in d])
    return str(d)
