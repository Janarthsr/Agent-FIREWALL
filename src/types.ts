export type UserRole = 'student' | 'expert' | 'sponsor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type EngagementModel = 'FUNDED' | 'STIPEND' | 'KNOWLEDGE' | 'INSTITUTIONAL';

export interface ProjectDocument {
  name: string;
  size: string;
  uploaded_at: string;
  type?: string;
}

export interface Project {
  id: string;
  title: string;
  problem_statement?: string;
  public_summary: string;
  confidential_brief: string;
  sensitivity: string;
  engagement_model: EngagementModel;
  budget_inr: number;
  credit_pool_cu: number;
  status: string;
  sponsor_id: string;
  charter_id?: string;
  documents?: ProjectDocument[];
  created_at: string;
  charter?: Charter;
  milestones?: Milestone[];
  members?: ProjectMember[];
}

export interface Charter {
  id: string;
  project_id: string;
  version: string;
  content_text: string;
  engagement_model: string;
  ip_terms: string;
  acceptance_criteria: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  order_index: number;
  status: string;
  allocated_amount_inr: number;
  escrow_state: 'UNFUNDED' | 'HELD' | 'SETTLED' | 'NON_MONETARY';
  acceptance_criteria: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  name?: string;
  email?: string;
  role: string;
  status: string;
  weight: number;
  created_at: string;
}

export interface FirewallReceipt {
  receipt_id: string;
  agent_id: string;
  agent_name: string;
  human_owner_id: string;
  human_owner_name: string;
  tool: string;
  args_summary: string;
  project_id: string;
  timestamp: string;
  scope_check: 'PASS' | 'FAIL';
  sensitivity_check: 'PASS' | 'FAIL';
  injection_check: 'PASS' | 'FAIL';
  side_effect_check: 'PASS' | 'FAIL';
  final_decision: 'ALLOW' | 'APPROVAL' | 'BLOCK';
  reason: string;
  ledger_entry_id: string;
}

export interface LedgerEntry {
  entry_id: string;
  ts: string;
  actor_type: string;
  actor_id: string;
  human_owner_id: string;
  project_id: string;
  action: string;
  decision: string;
  reason: string;
  payload_hash: string;
  prev_hash: string;
  current_hash: string;
}

export interface LedgerVerification {
  status: 'OK' | 'HASH_MISMATCH' | 'CHAIN_BROKEN';
  valid: boolean;
  message: string;
  count?: number;
  head_hash?: string;
  broken_entry_id?: string;
  expected_hash?: string;
  actual_hash?: string;
}

export interface ApprovalRequest {
  id: string;
  receipt_id: string;
  agent_id: string;
  human_owner_id: string;
  human_owner_name?: string;
  human_owner_email?: string;
  tool: string;
  args_summary: string;
  project_id: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  decision_by?: string;
  decision_reason?: string;
  created_at: string;
  decided_at?: string;
}

export interface Submission {
  id: string;
  project_id: string;
  milestone_id: string;
  author_id: string;
  author_name?: string;
  file_name: string;
  file_content: string;
  sha256_hash: string;
  ai_use_pct: number;
  similarity_score: number;
  similarity_flag: boolean;
  matched_submission_id?: string;
  created_at: string;
}

export interface Credential {
  id: string;
  verification_code: string;
  recipient_id: string;
  recipient_name: string;
  project_id: string;
  project_title: string;
  type: 'CERTIFICATE' | 'BADGE' | 'COAUTHOR' | 'MENTOR_LETTER' | 'INSTITUTION_CREDIT';
  credit_cu: number;
  author_rank?: number;
  status: 'VALID' | 'TAMPERED' | 'REVOKED';
  ledger_ref: string;
  ledger_entry_id?: string;
  human_issuer_id?: string;
  issued_at: string;
  ledger_warning?: string;
}

export interface Dispute {
  id: string;
  project_id: string;
  complainant_id: string;
  complainant_name?: string;
  target_type: 'CONTRIBUTION' | 'PAYOUT' | 'CREDENTIAL';
  target_id: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED';
  resolution?: string;
  resolved_by?: string;
  created_at: string;
  resolved_at?: string;
}
