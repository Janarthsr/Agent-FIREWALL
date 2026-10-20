"""Deterministic Scoping Agent Service."""
from typing import Dict, Any, List
from backend.services.ledger_service import LedgerService
from backend.db import get_db_connection

class ScopingService:
    @staticmethod
    def propose_milestones(project_id: str, human_owner_id: str) -> List[Dict[str, Any]]:
        """
        Deterministic Mock Scoping Agent generates research milestones.
        Logs MILESTONES_PROPOSED.
        """
        milestones = [
            {
                "id": f"m1_{project_id[:6]}",
                "project_id": project_id,
                "order_index": 1,
                "title": "Milestone 1: Dataset & Literature Preparation",
                "description": "Curate synthetic fundus dataset, clean ground-truth annotations, and conduct baseline literature review on microaneurysm detection.",
                "allocated_amount_inr": 35000,
                "acceptance_criteria": "Structured dataset audit report signed by lead expert, cleaned annotation manifest, and Jaccard similarity audit of preliminary writeup.",
                "status": "PROPOSED",
                "escrow_state": "UNFUNDED"
            },
            {
                "id": f"m2_{project_id[:6]}",
                "project_id": project_id,
                "order_index": 2,
                "title": "Milestone 2: Model Experimentation & Architecture Benchmarking",
                "description": "Train ResNet-50 and Vision Transformer (ViT) architectures on synthetic splits with differential privacy safeguards.",
                "allocated_amount_inr": 35000,
                "acceptance_criteria": "Reproducible training pipeline, cross-validation ROC-AUC >= 0.88 on holdout synthetic validation set, and Firewall clearance receipt for weights export.",
                "status": "PROPOSED",
                "escrow_state": "UNFUNDED"
            },
            {
                "id": f"m3_{project_id[:6]}",
                "project_id": project_id,
                "order_index": 3,
                "title": "Milestone 3: Clinical Validation & Final Report Synthesis",
                "description": "Blind validation with clinical expert review, error stratification analysis, and final collaborative whitepaper delivery.",
                "allocated_amount_inr": 30000,
                "acceptance_criteria": "Expert peer review score >= 85, final co-authored manuscript, and verifiable SHA-256 deliverable artefact ledger registration.",
                "status": "PROPOSED",
                "escrow_state": "UNFUNDED"
            }
        ]

        LedgerService.append(
            actor_type="AGENT",
            actor_id="scoping_agent",
            human_owner_id=human_owner_id,
            project_id=project_id,
            action="MILESTONES_PROPOSED",
            decision="ALLOW",
            reason="Deterministic Mock Scoping Agent proposed 3-stage milestone breakdown",
            payload={"milestones": milestones}
        )

        return milestones

    @staticmethod
    def accept_milestones(project_id: str, human_owner_id: str) -> bool:
        """
        Sponsor accepts proposed milestones.
        Logs MILESTONES_ACCEPTED.
        """
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            cur.execute("UPDATE milestones SET status = 'ACCEPTED' WHERE project_id = ?", (project_id,))
            conn.commit()
        finally:
            conn.close()

        LedgerService.append(
            actor_type="USER",
            actor_id=human_owner_id,
            human_owner_id=human_owner_id,
            project_id=project_id,
            action="MILESTONES_ACCEPTED",
            decision="ALLOW",
            reason="Project Sponsor approved scoping breakdown and milestone acceptance criteria",
            payload={"project_id": project_id}
        )
        return True
