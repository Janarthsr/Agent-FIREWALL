"""Deterministic Mock Escrow service."""
from typing import Dict, Any
from backend.services.ledger_service import LedgerService
from backend.db import get_db_connection

class EscrowMockService:
    @staticmethod
    def fund_milestone(milestone_id: str, amount_inr: int, human_owner_id: str, project_id: str) -> Dict[str, Any]:
        """
        Mock escrow funding for milestone.
        Escrow state becomes HELD.
        Logs ESCROW_FUNDED.
        """
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            cur.execute("""
            UPDATE milestones
            SET escrow_state = 'HELD', status = 'IN_PROGRESS'
            WHERE id = ?
            """, (milestone_id,))
            conn.commit()
        finally:
            conn.close()

        ledger_entry = LedgerService.append(
            actor_type="USER",
            actor_id=human_owner_id,
            human_owner_id=human_owner_id,
            project_id=project_id,
            action="ESCROW_FUNDED",
            decision="ALLOW",
            reason=f"Sponsor locked mock escrow of ₹{amount_inr:,} in HELD status for milestone {milestone_id}",
            payload={"milestone_id": milestone_id, "amount_inr": amount_inr, "escrow_state": "HELD"}
        )

        return {
            "milestone_id": milestone_id,
            "escrow_state": "HELD",
            "amount_inr": amount_inr,
            "ledger_entry_id": ledger_entry["entry_id"]
        }

    @staticmethod
    def release_escrow(milestone_id: str, project_id: str, human_owner_id: str) -> Dict[str, Any]:
        """
        Release escrow funds to contributors upon milestone review acceptance.
        Escrow state becomes SETTLED.
        Logs PAYOUT_RELEASED.
        """
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            cur.execute("""
            UPDATE milestones
            SET escrow_state = 'SETTLED', status = 'COMPLETED'
            WHERE id = ?
            """, (milestone_id,))
            conn.commit()
        finally:
            conn.close()

        ledger_entry = LedgerService.append(
            actor_type="USER",
            actor_id=human_owner_id,
            human_owner_id=human_owner_id,
            project_id=project_id,
            action="PAYOUT_RELEASED",
            decision="ALLOW",
            reason=f"Escrow disbursed upon milestone {milestone_id} acceptance",
            payload={"milestone_id": milestone_id, "escrow_state": "SETTLED"}
        )

        return {
            "milestone_id": milestone_id,
            "escrow_state": "SETTLED",
            "ledger_entry_id": ledger_entry["entry_id"]
        }
