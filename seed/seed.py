"""Deterministic database seeder for Agent Firewall."""
import os
import sys
import hashlib
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.db import init_db, get_db_connection
from backend.security import hash_password
from backend.services.ledger_service import LedgerService

def seed_database(clear_existing: bool = True):
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    if clear_existing:
        # Reset database tables
        cursor.execute("UPDATE _firewall_system_flags SET value = '1' WHERE key = 'bypass_trigger';")
        conn.commit()

        tables = [
            "users", "projects", "charters", "charter_acceptances", "milestones",
            "project_members", "agents", "submissions", "firewall_receipts",
            "approvals", "reviews", "payouts", "credentials", "disputes", "ledger_entries"
        ]
        for t in tables:
            cursor.execute(f"DELETE FROM {t};")
        
        cursor.execute("UPDATE _firewall_system_flags SET value = '0' WHERE key = 'bypass_trigger';")
        conn.commit()

    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    # 1. Seed Real Synthetic Users (Section 3)
    users_data = [
        ("usr_admin", "Admin", "admin.demo@gardenia.local", "admin", hash_password("Admin@2026")),
        ("usr_sponsor", "Dr. Anita Rao", "sponsor.demo@gardenia.local", "sponsor", hash_password("Demo@2026")),
        ("usr_expert", "Prof. Kiran Shah", "expert.demo@gardenia.local", "expert", hash_password("Demo@2026")),
        ("usr_student1", "Priya Sharma", "student.demo@gardenia.local", "student", hash_password("Demo@2026")),
        ("usr_student2", "Arun Kumar", "student2.demo@gardenia.local", "student", hash_password("Demo@2026")),
        ("usr_meera", "Meera Patel", "meera.student@gardenia.local", "student", hash_password("Demo@2026")),
    ]

    for uid, name, email, role, pwd in users_data:
        cursor.execute("""
        INSERT INTO users (id, name, email, role, password_hash, created_at, last_active_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (uid, name, email, role, pwd, now, now))

    conn.commit()
    conn.close()

    # Log initial user registration via LedgerService
    for uid, name, email, role, _ in users_data:
        LedgerService.append(
            actor_type="SYSTEM",
            actor_id=uid,
            human_owner_id=uid,
            project_id="GLOBAL",
            action="USER_REGISTERED",
            decision="ALLOW",
            reason=f"Synthetic account {email} ({role}) provisioned",
            payload={"name": name, "email": email, "role": role}
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    # 2. Seed Project 1: Automated Diabetic Retinopathy Screening (FUNDED - ₹1,00,000)
    p1_id = "proj_dr_01"
    p1_title = "Automated Diabetic Retinopathy Screening"
    p1_summary = "A clinical and machine learning collaboration establishing human-supervised automated screening pipelines for diabetic retinopathy in high-volume triage clinics."
    p1_brief = "Synthetic confidential research brief: Proprietary fundus photography feature embeddings, retinal lesion ground truth masks, and hospital validation cohorts (Apollo Retinal Network)."
    
    charter_text = """CHARTER AGREEMENT v1.0 — AUTOMATED DIABETIC RETINOPATHY SCREENING
1. Engagement Model: FUNDED (Escrow milestone disbursement)
2. Roles & Governance: Sponsor funds; Lead Expert reviews; Student researchers execute.
3. Intellectual Property: Sponsor receives commercial non-exclusive licence to trained artefacts. Contributors retain academic publication rights.
4. Confidentiality: Source DICOM images and clinical notes are CONFIDENTIAL. External exfiltration or cloud inference is prohibited.
5. Permitted AI Tools: Local deterministic code and scoped assistant tools only.
6. Reward Formula: ₹1,00,000 total budget. 10% Platform fee, 5% AI reserve, ₹85,000 net pool. 30% Expert advisory (₹25,500), 70% Student pool (₹59,500). Student pool split 40% equal (₹23,800) and 60% weighted (₹35,700).
7. Exit & Clawback: Failure to complete acceptance criteria forfeits weighted portion; equal base is protected upon verified time contribution.
8. AI Attribution: AI tools earn ₹0. All generated work must be attributed to directing human."""

    charter_id_1 = "cht_dr_v1"
    cursor.execute("""
    INSERT INTO charters (id, project_id, version, content_text, engagement_model, ip_terms, acceptance_criteria, created_at)
    VALUES (?, ?, '1.0', ?, 'FUNDED', 'Dual academic-commercial licence', 'Peer-reviewed clinical validation score >= 85', ?)
    """, (charter_id_1, p1_id, charter_text, now))

    cursor.execute("""
    INSERT INTO projects (
        id, title, public_summary, confidential_brief, sensitivity,
        engagement_model, budget_inr, credit_pool_cu, status, sponsor_id, charter_id, created_at
    ) VALUES (?, ?, ?, ?, 'CONFIDENTIAL', 'FUNDED', 100000, 0, 'PUBLISHED', 'usr_sponsor', ?, ?)
    """, (p1_id, p1_title, p1_summary, p1_brief, charter_id_1, now))

    # Milestones for Project 1
    m1_id = "ms_dr_01"
    m2_id = "ms_dr_02"
    m3_id = "ms_dr_03"
    milestones = [
        (m1_id, p1_id, "Milestone 1: Dataset & Literature Preparation", "Curate synthetic fundus dataset, clean annotations, baseline literature.", 1, "PROPOSED", 35000, "UNFUNDED", "Data cleanliness audit signed by expert"),
        (m2_id, p1_id, "Milestone 2: Model Experimentation & Benchmarking", "Vision Transformer experimentation with differential privacy.", 2, "PROPOSED", 35000, "UNFUNDED", "ROC-AUC >= 0.88 on synthetic test set"),
        (m3_id, p1_id, "Milestone 3: Clinical Validation & Final Report", "Double-blind expert evaluation and final research paper.", 3, "PROPOSED", 30000, "UNFUNDED", "Lead expert review score >= 85 and co-authorship signoff")
    ]
    for mid, pid, title, desc, idx, st, amt, esc, crt in milestones:
        cursor.execute("""
        INSERT INTO milestones (id, project_id, title, description, order_index, status, allocated_amount_inr, escrow_state, acceptance_criteria)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (mid, pid, title, desc, idx, st, amt, esc, crt))

    # 3. Seed Project 2: Kannada Text Classification (KNOWLEDGE - UNPAID - 100 CU - No Rs/₹)
    p2_id = "proj_know_02"
    p2_title = "Kannada Text Classification"
    p2_summary = "Non-monetary academic research initiative establishing baseline transformer classifiers for low-resource Kannada regional texts and municipal gazettes."
    p2_brief = "Open research protocol specification: synthetic multi-domain Kannada news corpora, tokenization standards, and dialectal variance benchmarks."
    charter_id_2 = "cht_know_v1"
    charter_text_2 = """CHARTER AGREEMENT v1.0 — KANNADA TEXT CLASSIFICATION BENCHMARK
1. Engagement Model: KNOWLEDGE (Unpaid - Pure Academic Credit & Contribution Units)
2. Rewards & Recognition: 100 Contribution Units (CU). Verifiable digital credential certificates, badge awards, formal author order attribution.
3. Commercial Notice: NO MONETARY PAYMENT. Zero fiat currency distribution.
4. Authorship Order: Primary student contributor (Priya Sharma - 36.0 CU) first author; Arun Kumar (24.8 CU) second author; Meera Patel (19.2 CU) third author; Prof. Kiran Shah (20.0 CU) senior supervising author.
5. Open Access: Deliverables licensed under CC-BY-SA 4.0 for non-commercial academic research."""

    cursor.execute("""
    INSERT INTO charters (id, project_id, version, content_text, engagement_model, ip_terms, acceptance_criteria, created_at)
    VALUES (?, ?, '1.0', ?, 'KNOWLEDGE', 'CC-BY-SA 4.0 Open Science', 'Reproducible evaluation notebook and verified benchmark score', ?)
    """, (charter_id_2, p2_id, charter_text_2, now))

    cursor.execute("""
    INSERT INTO projects (
        id, title, public_summary, confidential_brief, sensitivity,
        engagement_model, budget_inr, credit_pool_cu, status, sponsor_id, charter_id, created_at
    ) VALUES (?, ?, ?, ?, 'CONFIDENTIAL', 'KNOWLEDGE', 0, 100, 'PUBLISHED', 'usr_sponsor', ?, ?)
    """, (p2_id, p2_title, p2_summary, p2_brief, charter_id_2, now))

    cursor.execute("""
    INSERT INTO milestones (id, project_id, title, description, order_index, status, allocated_amount_inr, escrow_state, acceptance_criteria)
    VALUES ('ms_know_01', ?, 'Corpus Annotation & Tokenizer Benchmark', 'Annotate 10,000 synthetic sentences and benchmark Kannada BPE tokenizers.', 1, 'COMPLETED', 0, 'NON_MONETARY', '100% reproducible protocol published')
    """, (p2_id,))

    # Seed Agents with Named Human Owners
    agents_data = [
        ("agt_scoping", "Scoping Agent", "SCOPING", "usr_sponsor", p1_id, "search_docs,summarize,propose_milestones", "MockLLM-Deterministic-v1", "ACTIVE"),
        ("agt_research", "Research Agent", "RESEARCH", "usr_student1", p1_id, "search_docs,summarize,similarity_check,send_email,export", "MockLLM-Deterministic-v1", "ACTIVE"),
        ("agt_reviewer", "Reviewer Agent", "REVIEWER", "usr_expert", p1_id, "search_docs,similarity_check,grade_rubric", "MockLLM-Deterministic-v1", "ACTIVE"),
    ]
    for aid, aname, atype, aowner, apid, atools, amod, ast in agents_data:
        cursor.execute("""
        INSERT INTO agents (id, name, type, owner_user_id, project_id, allowed_tools, model, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (aid, aname, atype, aowner, apid, atools, amod, ast))

    # Baseline submission
    sub1_content = """Automated diabetic retinopathy screening using Vision Transformers and deep convolutional networks requires rigorous preprocessing of fundus photography. Microaneurysms represent the earliest clinically detectable sign of diabetic retinopathy, manifesting as tiny red dots with sharp margins. Automated detection relies on contrast-limited adaptive histogram equalization (CLAHE) followed by multi-scale morphological filtering."""
    sub1_hash = hashlib.sha256(sub1_content.encode("utf-8")).hexdigest()
    cursor.execute("""
    INSERT INTO submissions (
        id, project_id, milestone_id, author_id, file_name, file_content,
        sha256_hash, ai_use_pct, similarity_score, similarity_flag, matched_submission_id, created_at
    ) VALUES ('sub_base_01', ?, 'ms_dr_01', 'usr_student1', 'retinopathy_fundus_baseline.txt', ?, ?, 15.0, 0.0, 0, NULL, ?)
    """, (p1_id, sub1_content, sub1_hash, now))

    # Initial Memberships
    # Sponsor is creator/member of Project 1
    cursor.execute("""
    INSERT INTO project_members (id, project_id, user_id, role, status, weight, created_at)
    VALUES ('mem_sp_01', ?, 'usr_sponsor', 'sponsor', 'ACTIVE', 1.0, ?)
    """, (p1_id, now))

    # Sponsor is creator/member of Project 2
    cursor.execute("""
    INSERT INTO project_members (id, project_id, user_id, role, status, weight, created_at)
    VALUES ('mem_sp_02', ?, 'usr_sponsor', 'sponsor', 'ACTIVE', 1.0, ?)
    """, (p2_id, now))

    # Pre-seed Priya on Project 2 for verifiable credential test
    cursor.execute("""
    INSERT INTO project_members (id, project_id, user_id, role, status, weight, created_at)
    VALUES ('mem_k03', ?, 'usr_student1', 'student', 'ACTIVE', 0.5, ?)
    """, (p2_id, now))

    cursor.execute("""
    INSERT INTO charter_acceptances (id, user_id, charter_id, project_id, version, model_ack, accepted_at)
    VALUES ('ack_k_01', 'usr_student1', ?, ?, '1.0', 1, ?)
    """, (charter_id_2, p2_id, now))

    conn.commit()
    conn.close()

    from backend.services.credentials import CredentialService
    CredentialService.issue_credential(
        recipient_id="usr_student1",
        recipient_name="Priya Sharma",
        project_id=p2_id,
        project_title=p2_title,
        cred_type="CERTIFICATE",
        credit_cu=36.0,
        author_rank=1,
        human_issuer_id="usr_sponsor",
        custom_code="AF-2026-PRIYA01"
    )

    # Log project creations to Ledger
    LedgerService.append(
        actor_type="USER",
        actor_id="usr_sponsor",
        human_owner_id="usr_sponsor",
        project_id=p1_id,
        action="PROJECT_POSTED",
        decision="ALLOW",
        reason=f"Sponsor created funded research project '{p1_title}' with ₹1,00,000 budget",
        payload={"budget_inr": 100000, "engagement": "FUNDED"}
    )

    LedgerService.append(
        actor_type="USER",
        actor_id="usr_sponsor",
        human_owner_id="usr_sponsor",
        project_id=p1_id,
        action="CHARTER_PUBLISHED",
        decision="ALLOW",
        reason="Charter version 1.0 published with transparent escrow and reward formula",
        payload={"charter_id": charter_id_1, "version": "1.0"}
    )

    LedgerService.append(
        actor_type="USER",
        actor_id="usr_sponsor",
        human_owner_id="usr_sponsor",
        project_id=p2_id,
        action="PROJECT_POSTED",
        decision="ALLOW",
        reason=f"Sponsor posted non-monetary open research project '{p2_title}' with 100 CU",
        payload={"credit_cu": 100, "engagement": "KNOWLEDGE"}
    )

    if __name__ == "__main__":
        print("Seed complete: Synthetic users, projects, charters, agents, and ledger entries initialized.")

if __name__ == "__main__":
    seed_database()
