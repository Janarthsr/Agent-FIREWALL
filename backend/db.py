"""Database connection and trigger setup for SQLite append-only immutability."""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "agent_firewall.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(allow_recreate: bool = False):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_active_at TEXT
    );
    """)

    # Ensure last_active_at column exists if table was already created
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN last_active_at TEXT;")
    except Exception:
        pass

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        problem_statement TEXT,
        public_summary TEXT NOT NULL,
        confidential_brief TEXT NOT NULL,
        sensitivity TEXT NOT NULL,
        engagement_model TEXT NOT NULL,
        budget_inr INTEGER NOT NULL DEFAULT 0,
        credit_pool_cu INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        sponsor_id TEXT NOT NULL,
        charter_id TEXT,
        documents_json TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (sponsor_id) REFERENCES users(id)
    );
    """)

    # Ensure added columns exist if table was already created
    for col, col_type in [("problem_statement", "TEXT"), ("documents_json", "TEXT")]:
        try:
            cursor.execute(f"ALTER TABLE projects ADD COLUMN {col} {col_type};")
        except Exception:
            pass

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS charters (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        version TEXT NOT NULL,
        content_text TEXT NOT NULL,
        engagement_model TEXT NOT NULL,
        ip_terms TEXT NOT NULL,
        acceptance_criteria TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS charter_acceptances (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        charter_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        version TEXT NOT NULL,
        model_ack BOOLEAN NOT NULL DEFAULT 1,
        accepted_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS milestones (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        status TEXT NOT NULL,
        allocated_amount_inr INTEGER NOT NULL DEFAULT 0,
        escrow_state TEXT NOT NULL DEFAULT 'UNFUNDED',
        acceptance_criteria TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS project_members (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL,
        weight REAL NOT NULL DEFAULT 1.0,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        owner_user_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        allowed_tools TEXT NOT NULL,
        model TEXT NOT NULL,
        status TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        milestone_id TEXT NOT NULL,
        author_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_content TEXT NOT NULL,
        sha256_hash TEXT NOT NULL,
        ai_use_pct REAL NOT NULL DEFAULT 0.0,
        similarity_score REAL NOT NULL DEFAULT 0.0,
        similarity_flag BOOLEAN NOT NULL DEFAULT 0,
        matched_submission_id TEXT,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS firewall_receipts (
        receipt_id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        agent_name TEXT NOT NULL,
        human_owner_id TEXT NOT NULL,
        human_owner_name TEXT NOT NULL,
        tool TEXT NOT NULL,
        args_summary TEXT NOT NULL,
        project_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        scope_check TEXT NOT NULL,
        sensitivity_check TEXT NOT NULL,
        injection_check TEXT NOT NULL,
        side_effect_check TEXT NOT NULL,
        final_decision TEXT NOT NULL,
        reason TEXT NOT NULL,
        ledger_entry_id TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS approvals (
        id TEXT PRIMARY KEY,
        receipt_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        human_owner_id TEXT NOT NULL,
        tool TEXT NOT NULL,
        args_summary TEXT NOT NULL,
        project_id TEXT NOT NULL,
        status TEXT NOT NULL,
        decision_by TEXT,
        decision_reason TEXT,
        created_at TEXT NOT NULL,
        decided_at TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        milestone_id TEXT NOT NULL,
        submission_id TEXT NOT NULL,
        reviewer_id TEXT NOT NULL,
        decision TEXT NOT NULL,
        feedback TEXT NOT NULL,
        score INTEGER NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payouts (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        milestone_id TEXT NOT NULL,
        recipient_id TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        role TEXT NOT NULL,
        amount_inr INTEGER NOT NULL DEFAULT 0,
        credit_cu REAL NOT NULL DEFAULT 0.0,
        status TEXT NOT NULL,
        details_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS credentials (
        id TEXT PRIMARY KEY,
        verification_code TEXT UNIQUE NOT NULL,
        recipient_id TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        project_id TEXT NOT NULL,
        project_title TEXT NOT NULL,
        type TEXT NOT NULL,
        credit_cu REAL NOT NULL DEFAULT 0.0,
        author_rank INTEGER,
        status TEXT NOT NULL,
        ledger_ref TEXT NOT NULL,
        issued_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS disputes (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        complainant_id TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL,
        resolution TEXT,
        resolved_by TEXT,
        created_at TEXT NOT NULL,
        resolved_at TEXT
    );
    """)

    # Ledger table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ledger_entries (
        entry_id TEXT PRIMARY KEY,
        ts TEXT NOT NULL,
        actor_type TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        human_owner_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        action TEXT NOT NULL,
        decision TEXT NOT NULL,
        reason TEXT NOT NULL,
        payload_hash TEXT NOT NULL,
        prev_hash TEXT NOT NULL,
        current_hash TEXT NOT NULL
    );
    """)

    # Control flag for demo tamper test
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS _firewall_system_flags (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
    """)
    cursor.execute("INSERT OR IGNORE INTO _firewall_system_flags VALUES ('bypass_trigger', '0');")

    # Immutability triggers on ledger_entries
    cursor.execute("DROP TRIGGER IF EXISTS trg_ledger_no_update;")
    cursor.execute("""
    CREATE TRIGGER trg_ledger_no_update
    BEFORE UPDATE ON ledger_entries
    WHEN (SELECT value FROM _firewall_system_flags WHERE key = 'bypass_trigger') != '1'
    BEGIN
        SELECT RAISE(ABORT, 'LEDGER IMMUTABLE: Updates to ledger_entries are strictly prohibited by protocol.');
    END;
    """)

    cursor.execute("DROP TRIGGER IF EXISTS trg_ledger_no_delete;")
    cursor.execute("""
    CREATE TRIGGER trg_ledger_no_delete
    BEFORE DELETE ON ledger_entries
    WHEN (SELECT value FROM _firewall_system_flags WHERE key = 'bypass_trigger') != '1'
    BEGIN
        SELECT RAISE(ABORT, 'LEDGER IMMUTABLE: Deletions from ledger_entries are strictly prohibited by protocol.');
    END;
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully with append-only ledger triggers.")
