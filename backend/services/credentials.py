"""Verifiable Academic & Contribution Credentials Service."""
import uuid
import time
from typing import Dict, Any, List, Optional
from backend.services.ledger_service import LedgerService
from backend.db import get_db_connection

class CredentialService:
    @staticmethod
    def issue_credential(
        recipient_id: str,
        recipient_name: str,
        project_id: str,
        project_title: str,
        cred_type: str,  # CERTIFICATE, BADGE, COAUTHOR, MENTOR_LETTER, INSTITUTION_CREDIT
        credit_cu: float = 0.0,
        author_rank: Optional[int] = None,
        human_issuer_id: str = "admin.demo",
        custom_code: Optional[str] = None
    ) -> Dict[str, Any]:
        """Issue tamper-evident credential registered on the ledger."""
        cred_id = f"crd_{uuid.uuid4().hex[:10]}"
        verification_code = custom_code or f"AF-2026-{uuid.uuid4().hex[:8].upper()}"
        issued_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # Register to Ledger first
        ledger_entry = LedgerService.append(
            actor_type="SYSTEM",
            actor_id="credential_engine",
            human_owner_id=human_issuer_id,
            project_id=project_id,
            action="CREDENTIAL_ISSUED",
            decision="ALLOW",
            reason=f"Issued verifiable {cred_type} to {recipient_name} with code {verification_code}",
            payload={
                "recipient_id": recipient_id,
                "recipient_name": recipient_name,
                "type": cred_type,
                "credit_cu": credit_cu,
                "author_rank": author_rank,
                "verification_code": verification_code
            }
        )

        conn = get_db_connection()
        try:
            cur = conn.cursor()
            cur.execute("""
            INSERT INTO credentials (
                id, verification_code, recipient_id, recipient_name, project_id,
                project_title, type, credit_cu, author_rank, status, ledger_ref, issued_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'VALID', ?, ?)
            """, (
                cred_id, verification_code, recipient_id, recipient_name, project_id,
                project_title, cred_type, credit_cu, author_rank,
                ledger_entry["entry_id"], issued_at
            ))
            conn.commit()
        finally:
            conn.close()

        return {
            "id": cred_id,
            "verification_code": verification_code,
            "recipient_id": recipient_id,
            "recipient_name": recipient_name,
            "project_id": project_id,
            "project_title": project_title,
            "type": cred_type,
            "credit_cu": credit_cu,
            "author_rank": author_rank,
            "status": "VALID",
            "ledger_ref": ledger_entry["entry_id"],
            "issued_at": issued_at
        }

    @staticmethod
    def verify_credential(verification_code: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM credentials WHERE verification_code = ?", (verification_code,))
            row = cur.fetchone()
            if not row:
                return None
            cred = dict(row)

            # Cross-verify ledger integrity
            ledger_health = LedgerService.verify()
            if not ledger_health["valid"]:
                cred["status"] = "TAMPERED"
                cred["ledger_warning"] = "Ledger integrity check failed! Proof of issuance compromised."

            return cred
        finally:
            conn.close()

    @staticmethod
    def revoke_credential(verification_code: str, human_owner_id: str, reason: str) -> bool:
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM credentials WHERE verification_code = ?", (verification_code,))
            row = cur.fetchone()
            if not row:
                return False
            cred = dict(row)

            cur.execute("UPDATE credentials SET status = 'REVOKED' WHERE verification_code = ?", (verification_code,))
            conn.commit()

            LedgerService.append(
                actor_type="USER",
                actor_id=human_owner_id,
                human_owner_id=human_owner_id,
                project_id=cred["project_id"],
                action="CREDENTIAL_REVOKED",
                decision="BLOCK",
                reason=f"Credential {verification_code} revoked: {reason}",
                payload={"verification_code": verification_code}
            )
            return True
        finally:
            conn.close()
