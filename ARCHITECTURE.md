# AGENT FIREWALL — SYSTEM ARCHITECTURE

## 1. High-Level System Architecture

Agent Firewall implements a decoupled, defense-in-depth architecture separating autonomous agent proposal generation from deterministic policy enforcement and cryptographic auditability.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│           Next.js / React 19 SPA · Tailwind CSS · TypeScript           │
│        (Role-Aware Interface: Sponsor · Student · Expert · Admin)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST APIs
┌───────────────────────────────────▼────────────────────────────────────┐
│                       FULLSTACK APPLICATION LAYER                      │
│             Node.js / Express Gateway + Python 3.11 Backend            │
│                                                                        │
│  ┌──────────────────┐  ┌───────────────────┐  ┌─────────────────────┐  │
│  │   Auth & RBAC    │  │  Scoping Service  │  │   Matching & COI    │  │
│  └──────────────────┘  └───────────────────┘  └─────────────────────┘  │
│  ┌──────────────────┐  ┌───────────────────┐  ┌─────────────────────┐  │
│  │   MockLLM &      │  │  Deterministic    │  │ Cryptographic SHA256│  │
│  │   Adapter [MOCK] │──►  Firewall Engine  ├──► Ledger Chain Service│  │
│  └──────────────────┘  └─────────┬─────────┘  └──────────┬──────────┘  │
│                                  │ Receipt Output        │             │
│  ┌──────────────────┐            │            ┌──────────▼──────────┐  │
│  │   Reward & Credit│◄───────────┴────────────┤ SQLite Append-Only  │  │
│  │   Settlement     │                         │ Triggers (No UPD/DEL)│  │
│  └──────────────────┘                         └─────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Deterministic Firewall Engine

The Firewall is the core security boundary of the platform. Agents **never** make security decisions; code decides.

### Evaluation Pipeline & Priority
Every proposed tool call executes through 4 distinct checks in strict sequential order:

```
[Agent Proposal] ──► 1. SCOPE CHECK
                           │
                           ├── (Target != Current Project) ──► BLOCK ("cross-project")
                           ▼
                     2. SENSITIVITY CHECK
                           │
                           ├── (Confidential & External)   ──► BLOCK ("confidential data leaving")
                           ▼
                     3. INJECTION CHECK
                           │
                           ├── (Signal Detected & SideEffect) ─► BLOCK ("injection + side effect")
                           ▼
                     4. SIDE_EFFECT CHECK
                           │
                           ├── (Tool in SIDE_EFFECT_TOOLS) ──► APPROVAL ("requires human owner")
                           ▼
                         ALLOW ("All checks passed")
```

### Decision Priority
$$\text{BLOCK} > \text{APPROVAL} > \text{ALLOW}$$

### Hard Block Guarantee
- **A BLOCK can NEVER enter an approval path.**
- **Admins have NO bypass mechanism.** The application code strictly disallows overriding a Firewall BLOCK.
- **Fail-Safe Design:** Even if Check 3 (Injection Detector) is disabled or completely misses an obfuscated payload, Checks 2 and 4 still intercept the exfiltration attempt.

### Human Ownership Guarantee
- Every agent must have a registered `human_owner_id`.
- If an unowned or orphaned agent attempts execution, the Firewall intercepts and immediately issues a hard `BLOCK` with reason: *"Agent without named human owner cannot run"*.

---

## 3. Cryptographic Append-Only Ledger

The ledger is the immutable single source of truth for all consequential system interactions.

### Hash Linkage Formula
For any entry $i$, the current cryptographic digest is defined as:

$$\text{current\_hash}_i = \text{SHA256}\Big(\text{prev\_hash}_i \mathbin{\Vert} \text{entry\_id}_i \mathbin{\Vert} \text{ts}_i \mathbin{\Vert} \text{actor\_id}_i \mathbin{\Vert} \text{owner\_id}_i \mathbin{\Vert} \text{project\_id}_i \mathbin{\Vert} \text{action}_i \mathbin{\Vert} \text{decision}_i \mathbin{\Vert} \text{reason}_i \mathbin{\Vert} \text{payload\_hash}_i\Big)$$

Where:
- Genesis entry $\text{prev\_hash}_0 = 0^{64}$ (64 hexadecimal zeros).
- $\text{payload\_hash} = \text{SHA256}(\text{canonical\_json}(\text{payload}))$.

### Database-Level Immutability
SQLite native database triggers abort any unauthorized write operations:
```sql
CREATE TRIGGER trg_ledger_no_update
BEFORE UPDATE ON ledger_entries
WHEN (SELECT value FROM _firewall_system_flags WHERE key = 'bypass_trigger') != '1'
BEGIN
    SELECT RAISE(ABORT, 'LEDGER IMMUTABLE: Updates to ledger_entries are strictly prohibited.');
END;

CREATE TRIGGER trg_ledger_no_delete
BEFORE DELETE ON ledger_entries
WHEN (SELECT value FROM _firewall_system_flags WHERE key = 'bypass_trigger') != '1'
BEGIN
    SELECT RAISE(ABORT, 'LEDGER IMMUTABLE: Deletions from ledger_entries are strictly prohibited.');
END;
```

### Verification & Tamper Detection
- `ledger_service.verify()` performs a full sequential chain walk.
- It recomputes the expected SHA-256 hash for every row and validates previous hash linkage.
- If any row's payload, decision, or reason is modified, verification returns `HASH_MISMATCH` and pinpoints the corrupted entry ID.

---

## 4. Reward & Settlement Mathematics

### Funded Model (Canonical Worked Example)
- Total Budget: **₹1,00,000**
- Platform Fee: $10\% \times ₹1,00,000 = \mathbf{₹10,000}$
- AI Reserve: $5\% \times ₹1,00,000 = \mathbf{₹5,000}$
- Net Collaboration Pool: $₹1,00,000 - ₹10,000 - ₹5,000 = \mathbf{₹85,000}$
- Lead Expert Share: $30\% \times ₹85,000 = \mathbf{₹25,500}$
- Student Pool: $70\% \times ₹85,000 = \mathbf{₹59,500}$
  - **Equal Base Share (40%):** $40\% \times ₹59,500 = \mathbf{₹23,800} \implies \mathbf{₹7,933}$ each.
  - **Weighted Contribution (60%):** $60\% \times ₹59,500 = \mathbf{₹35,700}$
    - Priya ($\text{weight} = 0.5$): $0.5 \times ₹35,700 = \mathbf{₹17,850}$
    - Arun ($\text{weight} = 0.3$): $0.3 \times ₹35,700 = \mathbf{₹10,710}$
    - Meera ($\text{weight} = 0.2$): $0.2 \times ₹35,700 = \mathbf{₹7,140}$
- **Final Disbursed Payouts:**
  - Priya: $₹17,850 + ₹7,933 = \mathbf{₹25,783}$
  - Arun: $₹10,710 + ₹7,933 = \mathbf{₹18,643}$
  - Meera: $₹7,140 + ₹7,934 = \mathbf{₹15,074}$
  - Expert: $\mathbf{₹25,500}$
  - **Total Disbursed:** $\mathbf{₹1,00,000}$
  - **AI Earns:** $\mathbf{₹0}$

### Knowledge Model (Non-Monetary Credit Engine)
- Total Allocation: **100 Contribution Units (CU)**
- Expert Share: $20\% \times 100 = \mathbf{20.0\text{ CU}}$
- Student Pool: $80\% \times 100 = \mathbf{80.0\text{ CU}}$
  - Equal Base Share (30%): $30\% \times 80 = \mathbf{24.0\text{ CU}} \implies \mathbf{8.0\text{ CU}}$ each.
  - Weighted Share (70%): $70\% \times 80 = \mathbf{56.0\text{ CU}}$
    - Priya ($0.5$): $0.5 \times 56 = \mathbf{28.0\text{ CU}} \implies \text{Total } \mathbf{36.0\text{ CU}}$ (Rank 1 Author).
    - Arun ($0.3$): $0.3 \times 56 = \mathbf{16.8\text{ CU}} \implies \text{Total } \mathbf{24.8\text{ CU}}$ (Rank 2 Author).
    - Meera ($0.2$): $0.2 \times 56 = \mathbf{11.2\text{ CU}} \implies \text{Total } \mathbf{19.2\text{ CU}}$ (Rank 3 Author).
- **Rule:** Strictly zero INR, Rs, or fiat symbols. Recognition exclusively via verifiable badges and manuscript order.

---

## 5. Security & Isolation Model

1. **Documents as Data, Never Instructions:** Input PDFs and project texts are treated as passive strings. Hidden instructions or prompt injections inside user content are stripped of administrative capabilities.
2. **Credential Blindness:** Agents never hold database credentials, API keys, email tokens, or escrow keys. All privileged integrations reside strictly within backend service workers.
3. **Double Acceptance Gate:** Non-members attempting to read the confidential brief receive an HTTP 403. Access requires signing the Charter and acknowledging the engagement model.

---

## 6. Production Scalability Roadmap

For multi-institution enterprise deployment:
1. **Relational Layer:** Migrate SQLite to PostgreSQL with row-level security (RLS) and partition-based ledger tables.
2. **Asynchronous Execution:** Deploy Celery / Redis task queues to sandbox agent tool calls inside isolated Docker / gVisor containers per project.
3. **Horizontally Scaled Firewall:** Stateless Firewall evaluation nodes operating behind an API gateway with sub-millisecond regex & boundary evaluation.
4. **Merkle Batching:** Ledger entries batched every hour into a Merkle root tree, with roots anchored to Ethereum or Polygon for decentralized third-party auditability.
