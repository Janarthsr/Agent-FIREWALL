"""Unit tests for Ledger append-only immutability and verification."""
import unittest
import sys
import os
import sqlite3

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from backend.db import init_db, get_db_connection
from backend.services.ledger_service import LedgerService

class TestLedger(unittest.TestCase):
    def setUp(self):
        init_db()
        # Clean state for isolated ledger testing
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE _firewall_system_flags SET value = '1' WHERE key = 'bypass_trigger';")
        conn.commit()
        cur.execute("DELETE FROM ledger_entries;")
        cur.execute("UPDATE _firewall_system_flags SET value = '0' WHERE key = 'bypass_trigger';")
        conn.commit()
        conn.close()

    def test_appends_chain_correctly(self):
        e1 = LedgerService.append("USER", "u1", "u1", "p1", "PROJECT_POSTED", "ALLOW", "Initial post")
        e2 = LedgerService.append("USER", "u2", "u2", "p1", "CHARTER_ACCEPTED", "ALLOW", "Charter v1 accepted")
        e3 = LedgerService.append("AGENT", "a1", "u2", "p1", "AGENT_TOOL_REQUEST", "ALLOW", "Search docs")

        self.assertEqual(e1["prev_hash"], "0" * 64)
        self.assertEqual(e2["prev_hash"], e1["current_hash"])
        self.assertEqual(e3["prev_hash"], e2["current_hash"])

        v = LedgerService.verify()
        self.assertTrue(v["valid"])
        self.assertEqual(v["status"], "OK")
        self.assertEqual(v["count"], 3)
        self.assertEqual(v["head_hash"], e3["current_hash"])

    def test_update_blocked_by_trigger(self):
        e1 = LedgerService.append("USER", "u1", "u1", "p1", "PROJECT_POSTED", "ALLOW", "Initial post")
        conn = get_db_connection()
        cur = conn.cursor()
        with self.assertRaises(sqlite3.DatabaseError) as ctx:
            cur.execute("UPDATE ledger_entries SET reason = 'TAMPERED' WHERE entry_id = ?", (e1["entry_id"],))
        self.assertIn("LEDGER IMMUTABLE", str(ctx.exception))
        conn.close()

    def test_delete_blocked_by_trigger(self):
        e1 = LedgerService.append("USER", "u1", "u1", "p1", "PROJECT_POSTED", "ALLOW", "Initial post")
        conn = get_db_connection()
        cur = conn.cursor()
        with self.assertRaises(sqlite3.DatabaseError) as ctx:
            cur.execute("DELETE FROM ledger_entries WHERE entry_id = ?", (e1["entry_id"],))
        self.assertIn("LEDGER IMMUTABLE", str(ctx.exception))
        conn.close()

    def test_tamper_detection(self):
        """Simulate deliberate tampering via demo bypass and verify HASH_MISMATCH."""
        e1 = LedgerService.append("USER", "u1", "u1", "p1", "PROJECT_POSTED", "ALLOW", "Legitimate post")
        e2 = LedgerService.append("USER", "u2", "u2", "p1", "CHARTER_ACCEPTED", "ALLOW", "Legitimate ack")

        # Bypass trigger explicitly to simulate attacker modifying database file directly
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE _firewall_system_flags SET value = '1' WHERE key = 'bypass_trigger';")
        conn.commit()

        # Tamper e1's decision
        cur.execute("UPDATE ledger_entries SET decision = 'TAMPERED_DENY' WHERE entry_id = ?", (e1["entry_id"],))
        cur.execute("UPDATE _firewall_system_flags SET value = '0' WHERE key = 'bypass_trigger';")
        conn.commit()
        conn.close()

        v = LedgerService.verify()
        self.assertFalse(v["valid"])
        self.assertEqual(v["status"], "HASH_MISMATCH")
        self.assertEqual(v["broken_entry_id"], e1["entry_id"])

if __name__ == "__main__":
    unittest.main()
