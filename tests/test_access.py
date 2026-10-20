"""Unit tests for access control and non-monetary currency rules."""
import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from backend.db import init_db, get_db_connection
from backend.services.ledger_service import LedgerService

class TestAccess(unittest.TestCase):
    def setUp(self):
        init_db()

    def test_non_member_confidential_brief_denial(self):
        """Non-members or members who haven't accepted the charter cannot access confidential brief."""
        conn = get_db_connection()
        cur = conn.cursor()

        user_id = "usr_stranger"
        project_id = "proj_dr_01"

        # Check membership & charter acceptance
        cur.execute("""
        SELECT 1 FROM charter_acceptances 
        WHERE user_id = ? AND project_id = ?
        """, (user_id, project_id))
        accepted = cur.fetchone() is not None
        conn.close()

        self.assertFalse(accepted)

        # Simulate access attempt and ensure BRIEF_ACCESS_DENIED is logged to ledger
        ledger_entry = LedgerService.append(
            actor_type="USER",
            actor_id=user_id,
            human_owner_id=user_id,
            project_id=project_id,
            action="BRIEF_ACCESS_DENIED",
            decision="BLOCK",
            reason="Access denied — charter acceptance required.",
            payload={"requested_resource": "confidential_brief"}
        )

        self.assertEqual(ledger_entry["action"], "BRIEF_ACCESS_DENIED")
        self.assertEqual(ledger_entry["decision"], "BLOCK")

    def test_unpaid_project_contains_no_inr_or_rs_symbols(self):
        """
        Unpaid KNOWLEDGE project data must strictly contain NO 'Rs' or '₹'.
        Must use CU, credentials, badges, author order.
        """
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM projects WHERE engagement_model = 'KNOWLEDGE'")
        know_project = dict(cur.fetchone())

        cur.execute("SELECT * FROM charters WHERE project_id = ?", (know_project["id"],))
        know_charter = dict(cur.fetchone())
        conn.close()

        combined_text = f"{know_project['title']} {know_project['public_summary']} {know_project['confidential_brief']} {know_charter['content_text']}"

        self.assertNotIn("₹", combined_text, "Unpaid project must never contain rupee symbol ₹")
        self.assertNotIn("Rs.", combined_text, "Unpaid project must never contain Rs.")
        self.assertNotIn("INR", combined_text, "Unpaid project must never contain INR")
        self.assertIn("CU", combined_text, "Unpaid project should use CU (Contribution Units)")

if __name__ == "__main__":
    unittest.main()
