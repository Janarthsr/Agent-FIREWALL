import { Project, LedgerEntry, LedgerVerification, FirewallReceipt, ApprovalRequest, Submission, Credential, Dispute } from './types';

const API_BASE = '/api';

function getHeaders(extra: Record<string, string> = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('agent_firewall_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/me`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createProject(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async publishProject(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${id}/publish`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async uploadDocument(projectId: string, document: any, userId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/documents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ document, user_id: userId }),
    });
    return res.json();
  },

  // Brief Access Control (403 test)
  async getConfidentialBrief(projectId: string, userId: string, role: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/brief?user_id=${userId}&user_role=${role}`);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  },

  // Charter Acceptance
  async acceptCharter(charterId: string, projectId: string, userId: string, version: string, modelAck: boolean) {
    const res = await fetch(`${API_BASE}/charters/${charterId}/accept`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ project_id: projectId, user_id: userId, version, model_ack: modelAck }),
    });
    return res.json();
  },

  // Scoping & Matching
  async proposeMilestones(projectId: string, userId: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/scope`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    return res.json();
  },

  async acceptMilestones(projectId: string, userId: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/milestones/accept`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    return res.json();
  },

  async getMatches(projectId: string, userId: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/matches?user_id=${userId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Escrow Funding
  async fundMilestone(milestoneId: string, projectId: string, amountInr: number, userId: string) {
    const res = await fetch(`${API_BASE}/milestones/${milestoneId}/fund`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ project_id: projectId, amount_inr: amountInr, user_id: userId }),
    });
    return res.json();
  },

  // Firewall
  async evaluateFirewall(data: any): Promise<FirewallReceipt> {
    const res = await fetch(`${API_BASE}/firewall/evaluate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getReceipts(projectId?: string): Promise<FirewallReceipt[]> {
    const url = projectId ? `${API_BASE}/firewall/receipts?project_id=${projectId}` : `${API_BASE}/firewall/receipts`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  // Approvals
  async getApprovals(): Promise<ApprovalRequest[]> {
    const res = await fetch(`${API_BASE}/approvals`, { headers: getHeaders() });
    return res.json();
  },

  async decideApproval(id: string, decision: 'APPROVED' | 'DENIED', decidedBy: string, reason?: string) {
    const res = await fetch(`${API_BASE}/approvals/${id}/decision`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ decision, decided_by: decidedBy, reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to decide approval');
    }
    return data;
  },

  // Submissions & Reviews
  async getSubmissions(projectId: string): Promise<Submission[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/submissions`, { headers: getHeaders() });
    return res.json();
  },

  async submitWork(data: any) {
    const res = await fetch(`${API_BASE}/milestones/${data.milestone_id}/submissions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async reviewSubmission(data: any) {
    const res = await fetch(`${API_BASE}/contributions/${data.submission_id}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async settleMilestone(milestoneId: string, projectId: string, userId: string) {
    const res = await fetch(`${API_BASE}/milestones/${milestoneId}/settle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ project_id: projectId, user_id: userId }),
    });
    return res.json();
  },

  async getRewardExplanation(projectId: string, model: string = 'FUNDED') {
    const res = await fetch(`${API_BASE}/payouts/${projectId}/explain?model=${model}`, { headers: getHeaders() });
    return res.json();
  },

  // Ledger
  async getLedger(filters?: { projectId?: string; actorId?: string; action?: string }): Promise<LedgerEntry[]> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('project_id', filters.projectId);
    if (filters?.actorId) params.append('actor_id', filters.actorId);
    if (filters?.action) params.append('action', filters.action);
    const res = await fetch(`${API_BASE}/ledger?${params.toString()}`, { headers: getHeaders() });
    return res.json();
  },

  async verifyLedger(): Promise<LedgerVerification> {
    const res = await fetch(`${API_BASE}/ledger/verify`, { headers: getHeaders() });
    return res.json();
  },

  async getLedgerHead(): Promise<{ head_hash: string }> {
    const res = await fetch(`${API_BASE}/ledger/head`, { headers: getHeaders() });
    return res.json();
  },

  // Credential Verification
  async verifyCredential(code: string): Promise<Credential> {
    const res = await fetch(`${API_BASE}/verify/${code}`, { headers: getHeaders() });
    return res.json();
  },

  // Disputes
  async getDisputes(): Promise<Dispute[]> {
    const res = await fetch(`${API_BASE}/disputes`, { headers: getHeaders() });
    return res.json();
  },

  async createDispute(data: any) {
    const res = await fetch(`${API_BASE}/disputes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async resolveDispute(disputeId: string, resolution: string, adminId: string) {
    const res = await fetch(`${API_BASE}/disputes/${disputeId}/resolve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ resolution, admin_id: adminId }),
    });
    return res.json();
  },

  // Demo Controls
  async resetDemo() {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST', headers: getHeaders() });
    return res.json();
  },

  async fastForwardDemo() {
    const res = await fetch(`${API_BASE}/demo/fast-forward`, { method: 'POST', headers: getHeaders() });
    return res.json();
  },

  async tamperLedger(entryId: string) {
    const res = await fetch(`${API_BASE}/demo/tamper/${entryId}`, { method: 'POST', headers: getHeaders() });
    return res.json();
  },

  async repairDemo() {
    const res = await fetch(`${API_BASE}/demo/repair`, { method: 'POST', headers: getHeaders() });
    return res.json();
  },
};
