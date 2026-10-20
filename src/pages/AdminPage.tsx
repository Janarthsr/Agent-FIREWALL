import React, { useState, useEffect } from 'react';
import { User, LedgerVerification, FirewallReceipt, Project } from '../types';
import { api } from '../api';
import { Shield, ShieldAlert, AlertOctagon, Database, Cpu, Wrench, RefreshCw, Lock, Terminal, Activity, CheckCircle2, Users, FileText } from 'lucide-react';

interface AdminPageProps {
  currentUser: User;
  ledgerStatus: LedgerVerification | null;
  receipts: FirewallReceipt[];
  onResetDemo: () => void;
  onFastForwardDemo: () => void;
  onTriggerStarScene: () => void;
  onTriggerTamper: () => void;
  onTriggerRepair: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  ledgerStatus,
  receipts,
  onResetDemo,
  onFastForwardDemo,
  onTriggerStarScene,
  onTriggerTamper,
  onTriggerRepair,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'USERS' | 'PROJECTS' | 'RECEIPTS' | 'LEDGER'>('OVERVIEW');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [uList, pList] = await Promise.all([
          api.getUsers(),
          api.getProjects(),
        ]);
        setUsers(uList);
        setProjects(pList);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      }
    };
    if (currentUser.role === 'admin') {
      fetchAdminData();
    }
  }, [currentUser]);

  // Non-admin authorization guard
  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-[#7a222b]/30 rounded text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#fbf0f1] text-[#7a222b] mx-auto flex items-center justify-center border border-[#7a222b]/30">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#1c1917] font-mono">AUTHORIZATION FAILURE (HTTP 403)</h2>
        <p className="text-xs text-[#57534e] leading-relaxed">
          Access to the Security Operations Console (/admin) is restricted exclusively to authenticated users with the <strong className="text-[#7a222b] font-mono">admin</strong> role. Your current authenticated identity is <strong className="text-[#1c1917]">{currentUser.name}</strong> ({currentUser.role}).
        </p>
        <p className="text-[11px] text-[#78716c] font-mono">
          Log out and authenticate with the Admin credentials (admin.demo@gardenia.local) to access this console.
        </p>
      </div>
    );
  }

  const isValid = ledgerStatus?.valid ?? true;

  return (
    <div className="space-y-8">
      {/* SOC Console Header */}
      <div className="bg-white border border-[#e7e2d9] rounded p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-[#7a222b] font-bold bg-[#fbf0f1] px-2.5 py-0.5 rounded border border-[#7a222b]/30">
                SECURITY OPERATIONS CONSOLE (SOC)
              </span>
              <span className="text-[#78716c] text-xs font-mono">RBAC LEVEL: ROOT ADMIN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] font-serif mb-1">
              Agent Firewall Administration & Security Audit
            </h1>
            <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl leading-relaxed">
              Supervise deterministic policy enforcement, inspect multi-user registry records, audit append-only SHA-256 hash chains, and control presentation walkthrough states.
            </p>
          </div>

          {/* Hard Block Banner */}
          <div className="p-4 bg-[#fbf0f1] border border-[#7a222b]/40 rounded text-xs font-mono text-[#7a222b] max-w-sm shrink-0">
            <strong className="block text-[#7a222b] font-bold mb-1">NON-NEGOTIABLE PROTOCOL:</strong>
            Hard Firewall BLOCK decisions can NEVER be overridden by an administrator. Human owners make approvals only where policy permits.
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#e7e2d9] text-xs font-mono overflow-x-auto pb-1">
          {(['OVERVIEW', 'USERS', 'PROJECTS', 'RECEIPTS', 'LEDGER'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveSubTab(t)}
              className={`px-3 py-1.5 rounded cursor-pointer transition-colors ${
                activeSubTab === t
                  ? 'bg-[#2d4a3e] text-white font-semibold'
                  : 'bg-[#f5f3ef] text-[#57534e] hover:text-[#1c1917]'
              }`}
            >
              {t === 'OVERVIEW'
                ? 'Overview & Controls'
                : t === 'USERS'
                ? `Users (${users.length})`
                : t === 'PROJECTS'
                ? `Initiatives (${projects.length})`
                : t === 'RECEIPTS'
                ? `Firewall Receipts (${receipts.length})`
                : 'Ledger Audit'}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: OVERVIEW & DEMO CONTROLS */}
      {activeSubTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Demo Controls Toolbar */}
          <div className="bg-white border border-[#e7e2d9] rounded p-6 shadow-xs">
            <h2 className="text-xs font-mono uppercase text-[#78716c] font-bold mb-4 tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#2d4a3e]" />
              <span>Judges Demo Controls (Deterministic Simulation Operations)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <button
                onClick={onTriggerStarScene}
                className="p-3 bg-[#fbf0f1] hover:bg-[#f5e0e3] text-[#7a222b] border border-[#7a222b]/30 rounded text-left transition-colors cursor-pointer group shadow-xs"
              >
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#7a222b]" />
                  <span>Run Star Scene</span>
                </div>
                <div className="text-[11px] text-[#7a222b]/80 mt-1">
                  Poisoned PDF exfiltration attack triggers hard Firewall BLOCK
                </div>
              </button>

              <button
                onClick={onFastForwardDemo}
                className="p-3 bg-[#eff6ff] hover:bg-[#dbeafe] text-[#1e3a8a] border border-[#1e3a8a]/30 rounded text-left transition-colors cursor-pointer group shadow-xs"
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#1e3a8a]" />
                  <span>Fast Forward Demo</span>
                </div>
                <div className="text-[11px] text-[#1e3a8a]/80 mt-1">
                  Jump instantly to completed presentation state with all receipts
                </div>
              </button>

              <button
                onClick={onTriggerTamper}
                className="p-3 bg-[#fef9ee] hover:bg-[#fcf1db] text-[#854d0e] border border-[#854d0e]/30 rounded text-left transition-colors cursor-pointer group shadow-xs"
              >
                <div className="font-bold flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-[#854d0e]" />
                  <span>Tamper Ledger Row</span>
                </div>
                <div className="text-[11px] text-[#854d0e]/80 mt-1">
                  Mutate an old entry to demonstrate cryptographic verification failure
                </div>
              </button>

              <button
                onClick={onTriggerRepair}
                className="p-3 bg-[#eef3f0] hover:bg-[#e0ebe4] text-[#2d4a3e] border border-[#2d4a3e]/30 rounded text-left transition-colors cursor-pointer group shadow-xs"
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-[#2d4a3e]" />
                  <span>Repair & Verify</span>
                </div>
                <div className="text-[11px] text-[#2d4a3e]/80 mt-1">
                  Restore hash linkage and reset to clean verified state
                </div>
              </button>

              <button
                onClick={onResetDemo}
                className="p-3 bg-[#f5f3ef] hover:bg-[#ede9e3] text-[#1c1917] border border-[#d6cebf] rounded text-left transition-colors cursor-pointer group shadow-xs"
              >
                <div className="font-bold flex items-center gap-1.5 text-[#1c1917]">
                  <RefreshCw className="w-4 h-4 text-[#78716c]" />
                  <span>Reset Entire Demo</span>
                </div>
                <div className="text-[11px] text-[#78716c] mt-1">
                  Re-seed database, clear caches, and return to pristine Step 1
                </div>
              </button>
            </div>
          </div>

          {/* SOC System Health Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ledger Integrity Card */}
            <div className="bg-white border border-[#e7e2d9] rounded p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#78716c]">LEDGER HASH CHAIN</span>
                <Database className="w-4 h-4 text-[#2d4a3e]" />
              </div>
              <div className="text-lg font-bold">
                {isValid ? (
                  <span className="text-[#2d4a3e] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    VERIFIED (OK)
                  </span>
                ) : (
                  <span className="text-[#7a222b] flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4" />
                    TAMPER DETECTED ({ledgerStatus?.status})
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#57534e] font-mono space-y-1 bg-[#f5f3ef] p-2.5 rounded border border-[#e7e2d9]">
                <div>Entries Walked: {ledgerStatus?.count || 17}</div>
                <div className="truncate">Head: {ledgerStatus?.head_hash?.slice(0, 18)}...</div>
              </div>
            </div>

            {/* Firewall Evaluation Stats */}
            <div className="bg-white border border-[#e7e2d9] rounded p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#78716c]">FIREWALL INTERCEPTIONS</span>
                <Shield className="w-4 h-4 text-[#2d4a3e]" />
              </div>
              <div className="text-lg font-bold text-[#1c1917] flex items-center gap-2">
                <span>{receipts.length} EVALUATIONS</span>
                <span className="w-2 h-2 rounded-full bg-[#2d4a3e]"></span>
              </div>
              <div className="text-[11px] text-[#57534e] font-mono space-y-1 bg-[#f5f3ef] p-2.5 rounded border border-[#e7e2d9]">
                <div>Blocks: {receipts.filter((r) => r.final_decision === 'BLOCK').length}</div>
                <div>Approvals: {receipts.filter((r) => r.final_decision === 'APPROVAL').length}</div>
                <div>Allowed: {receipts.filter((r) => r.final_decision === 'ALLOW').length}</div>
              </div>
            </div>

            {/* Adapter Architecture */}
            <div className="bg-white border border-[#e7e2d9] rounded p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#78716c]">LLM ADAPTER ARCHITECTURE</span>
                <Cpu className="w-4 h-4 text-[#2d4a3e]" />
              </div>
              <div className="text-lg font-bold text-[#1c1917]">
                <span>DETERMINISTIC MOCK</span>
              </div>
              <div className="text-[11px] text-[#57534e] font-mono space-y-1 bg-[#f5f3ef] p-2.5 rounded border border-[#e7e2d9]">
                <div>Fallback: MockLLM-Deterministic-v1</div>
                <div>Marked: [MOCK] on proposals</div>
                <div>Internet Requirement: 0%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: USERS INSPECTOR */}
      {activeSubTab === 'USERS' && (
        <div className="bg-white border border-[#e7e2d9] rounded p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d9]">
            <h2 className="text-sm font-bold text-[#1c1917] uppercase tracking-wider font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2d4a3e]" />
              <span>Real Database Users ({users.length})</span>
            </h2>
            <span className="text-xs font-mono text-[#78716c]">SOURCE OF TRUTH: SQLITE RBAC TABLE</span>
          </div>

          <div className="divide-y divide-[#e7e2d9]">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-[#1c1917] font-mono">{u.name}</div>
                  <div className="text-[#78716c] font-mono">{u.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] bg-[#f5f3ef] px-2 py-0.5 rounded border border-[#e7e2d9] uppercase font-bold text-[#2d4a3e]">
                    {u.role}
                  </span>
                  <span className="text-[#78716c] font-mono text-[11px]">ID: {u.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: INITIATIVES & MEMBERSHIPS INSPECTOR */}
      {activeSubTab === 'PROJECTS' && (
        <div className="bg-white border border-[#e7e2d9] rounded p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d9]">
            <h2 className="text-sm font-bold text-[#1c1917] uppercase tracking-wider font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2d4a3e]" />
              <span>Initiatives & Multi-User Memberships ({projects.length})</span>
            </h2>
            <span className="text-xs font-mono text-[#78716c]">SHARED BACKEND STATE</span>
          </div>

          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="p-4 bg-[#fbfaf8] border border-[#e7e2d9] rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#1c1917] font-serif">{p.title}</h3>
                    <div className="text-xs text-[#78716c] font-mono">ID: {p.id} · Model: {p.engagement_model}</div>
                  </div>
                  <span className="text-xs font-mono bg-[#eef3f0] text-[#2d4a3e] px-2.5 py-0.5 rounded border border-[#2d4a3e]/30 font-semibold">
                    {p.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#e7e2d9] text-xs">
                  <div className="font-semibold text-[#1c1917] font-mono mb-1">
                    Enrolled Members ({p.members?.length || 0}):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.members && p.members.length > 0 ? (
                      p.members.map((m) => (
                        <span
                          key={m.id}
                          className="px-2 py-0.5 bg-white border border-[#e7e2d9] rounded font-mono text-[11px] text-[#44403c]"
                        >
                          {m.name || m.user_id} ({m.role}, wt: {m.weight})
                        </span>
                      ))
                    ) : (
                      <span className="text-[#78716c] font-mono text-[11px]">No enrolled members</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: FIREWALL RECEIPTS INSPECTOR */}
      {activeSubTab === 'RECEIPTS' && (
        <div className="bg-white border border-[#e7e2d9] rounded p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d9]">
            <h2 className="text-sm font-bold text-[#1c1917] uppercase tracking-wider font-mono flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#2d4a3e]" />
              <span>Deterministic Firewall Receipts ({receipts.length})</span>
            </h2>
            <span className="text-xs font-mono text-[#78716c]">EVALUATION AUDIT TRAIL</span>
          </div>

          <div className="space-y-3">
            {receipts.map((r) => {
              const isBlock = r.final_decision === 'BLOCK';
              const isApproval = r.final_decision === 'APPROVAL';
              return (
                <div
                  key={r.receipt_id}
                  className={`p-4 rounded border text-xs font-mono ${
                    isBlock
                      ? 'bg-[#fbf0f1] border-[#7a222b]/40 text-[#7a222b]'
                      : isApproval
                      ? 'bg-[#fef9ee] border-[#854d0e]/40 text-[#854d0e]'
                      : 'bg-[#eef3f0] border-[#2d4a3e]/30 text-[#2d4a3e]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 font-bold">
                    <span>
                      {r.agent_name || r.agent_id} → {r.tool}()
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold">
                      DECISION: {r.final_decision}
                    </span>
                  </div>
                  <div className="text-[11px] opacity-90 mb-1">
                    Owner: {r.human_owner_name || r.human_owner_id} · Timestamp: {r.timestamp}
                  </div>
                  <div className="text-[11px] opacity-80 mb-2">
                    Scope: {r.scope_check} | Sens: {r.sensitivity_check} | Inj: {r.injection_check} | Side: {r.side_effect_check}
                  </div>
                  <div className="text-xs font-sans italic border-t border-current/20 pt-1">
                    Reason: {r.reason}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 5: LEDGER AUDIT */}
      {activeSubTab === 'LEDGER' && (
        <div className="bg-white border border-[#e7e2d9] rounded p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d9]">
            <h2 className="text-sm font-bold text-[#1c1917] uppercase tracking-wider font-mono flex items-center gap-2">
              <Database className="w-4 h-4 text-[#2d4a3e]" />
              <span>Cryptographic Hash Chain Integrity</span>
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#78716c]">STATUS:</span>
              <span className={`font-bold ${isValid ? 'text-[#2d4a3e]' : 'text-[#7a222b]'}`}>
                {isValid ? 'VERIFIED (VALID)' : 'TAMPER DETECTED'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#f5f3ef] border border-[#e7e2d9] rounded space-y-2 font-mono text-xs">
            <div><strong>Head Hash:</strong> {ledgerStatus?.head_hash || 'Calculating...'}</div>
            <div><strong>Verified Entries Walked:</strong> {ledgerStatus?.count || 17}</div>
            <div><strong>Chain Algorithm:</strong> SHA-256 (h_i = SHA256(h_{'{i-1}'} + data_i))</div>
          </div>
        </div>
      )}

    </div>
  );
};
