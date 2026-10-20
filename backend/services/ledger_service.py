"""Append-only cryptographic ledger service."""
import hashlib
import json
import time
import uuid
from typing import Dict, Any, List, Tuple
from backend.db import get_db_connection

GENESIS_HASH = "0" * 64

class LedgerService:
    @staticmethod
    def compute_hash(
        prev_hash: str,
        entry_id: str,
        ts: str,
        actor_id: str,
        human_owner_id: str,
        project_id: str,
        action: str,
        decision: str,
        reason: str,
        payload_hash: str
    ) -> str:
        data = f"{prev_hash}{entry_id}{ts}{actor_id}{human_owner_id}{project_id}{action}{decision}{reason}{payload_hash}"
        return hashlib.sha256(data.encode("utf-8")).hexdigest()

    @staticmethod
    def get_last_entry(conn=None) -> Dict[str, Any]:
        close_conn = False
        if conn is None:
            conn = get_db_connection()
            close_conn = True
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM ledger_entries ORDER BY rowid DESC LIMIT 1")
            row = cur.fetchone()
            if row:
                return dict(row)
            return None
        finally:
            if close_conn:
                conn.close()

    @staticmethod
    def append(
        actor_type: str,
        actor_id: str,
        human_owner_id: str,
        project_id: str,
        action: str,
        decision: str = "ALLOW",
        reason: str = "",
        payload: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Atomically append a tamper-evident entry to the ledger."""
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            last_entry = LedgerService.get_last_entry(conn)
            prev_hash = last_entry["current_hash"] if last_entry else GENESIS_HASH

            entry_id = f"led_{uuid.uuid4().hex[:12]}"
            ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            
            payload_json = json.dumps(payload or {}, sort_keys=True)
            payload_hash = hashlib.sha256(payload_json.encode("utf-8")).hexdigest()

            current_hash = LedgerService.compute_hash(
                prev_hash=prev_hash,
                entry_id=entry_id,
                ts=ts,
                actor_id=actor_id,
                human_owner_id=human_owner_id,
                project_id=project_id,
                action=action,
                decision=decision,
                reason=reason,
                payload_hash=payload_hash
            )

            cur.execute("""
            INSERT INTO ledger_entries (
                entry_id, ts, actor_type, actor_id, human_owner_id, project_id,
                action, decision, reason, payload_hash, prev_hash, current_hash
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                entry_id, ts, actor_type, actor_id, human_owner_id, project_id,
                action, decision, reason, payload_hash, prev_hash, current_hash
            ))
            conn.commit()

            return {
                "entry_id": entry_id,
                "ts": ts,
                "actor_type": actor_type,
                "actor_id": actor_id,
                "human_owner_id": human_owner_id,
                "project_id": project_id,
                "action": action,
                "decision": decision,
                "reason": reason,
                "payload_hash": payload_hash,
                "prev_hash": prev_hash,
                "current_hash": current_hash
            }
        finally:
            conn.close()

    @staticmethod
    def verify() -> Dict[str, Any]:
        """Verify the integrity of the ledger chain."""
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM ledger_entries ORDER BY rowid ASC")
            rows = [dict(r) for r in cur.fetchall()]

            if not rows:
                return {
                    "status": "OK",
                    "valid": True,
                    "message": "LEDGER INTEGRITY VERIFIED (Empty genesis)",
                    "count": 0,
                    "head_hash": GENESIS_HASH
                }

            expected_prev_hash = GENESIS_HASH
            for index, row in enumerate(rows):
                # 1. Verify previous hash chain linkage
                if row["prev_hash"] != expected_prev_hash:
                    return {
                        "status": "CHAIN_BROKEN",
                        "valid": False,
                        "message": f"LEDGER INTEGRITY FAILED: Chain broken at entry {row['entry_id']} (Index {index})",
                        "broken_entry_id": row["entry_id"],
                        "index": index,
                        "expected_prev": expected_prev_hash,
                        "actual_prev": row["prev_hash"]
                    }

                # 2. Recompute current hash
                recomputed_hash = LedgerService.compute_hash(
                    prev_hash=row["prev_hash"],
                    entry_id=row["entry_id"],
                    ts=row["ts"],
                    actor_id=row["actor_id"],
                    human_owner_id=row["human_owner_id"],
                    project_id=row["project_id"],
                    action=row["action"],
                    decision=row["decision"],
                    reason=row["reason"],
                    payload_hash=row["payload_hash"]
                )

                if row["current_hash"] != recomputed_hash:
                    return {
                        "status": "HASH_MISMATCH",
                        "valid": False,
                        "message": f"LEDGER INTEGRITY FAILED: Hash mismatch at entry {row['entry_id']} (Index {index})",
                        "broken_entry_id": row["entry_id"],
                        "index": index,
                        "expected_hash": recomputed_hash,
                        "actual_hash": row["current_hash"]
                    }

                expected_prev_hash = row["current_hash"]

            return {
                "status": "OK",
                "valid": True,
                "message": "LEDGER INTEGRITY VERIFIED",
                "count": len(rows),
                "head_hash": rows[-1]["current_hash"]
            }
        finally:
            conn.close()

    @staticmethod
    def get_entries(project_id: str = None, actor_id: str = None, action: str = None, limit: int = 100):
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            query = "SELECT * FROM ledger_entries WHERE 1=1"
            params = []
            if project_id:
                query += " AND project_id = ?"
                params.append(project_id)
            if actor_id:
                query += " AND (actor_id = ? OR human_owner_id = ?)"
                params.extend([actor_id, actor_id])
            if action:
                query += " AND action = ?"
                params.append(action)
            query += " ORDER BY rowid DESC LIMIT ?"
            params.append(limit)

            cur.execute(query, params)
            return [dict(r) for r in cur.fetchall()]
        finally:
            conn.close()
