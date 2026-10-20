import React from 'react';
import { Project, LedgerVerification, User } from '../types';
import { Shield, Database, Cpu, CheckCircle2, AlertOctagon, ArrowRight, FileText, Lock, Users, PlusCircle } from 'lucide-react';

interface DashboardPageProps {
  projects: Project[];
  currentUser: User;
  ledgerStatus: LedgerVerification | null;
  onSelectProject: (projectId: string) => void;
  onNavigateTab: (tab: string) => void;
  onTriggerStarScene: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  projects,
  currentUser,
  ledgerStatus,
  onSelectProject,
  onNavigateTab,
  onTriggerStarScene,
}) => {
  const isSponsor = currentUser.role === 'sponsor';
  const isStudent = currentUser.role === 'student';
  const isExpert = currentUser.role === 'expert';
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-8">
      {/* Editorial Institutional Header Banner */}
      <div className="bg-white border border-[#e7e2d9] rounded p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#2d4a3e] font-semibold bg-[#eef3f0] px-2.5 py-0.5 rounded border border-[#2d4a3e]/30 uppercase tracking-widest">
                TRUST INFRASTRUCTURE · ACTIVE SESSION
              </span>
              <span className="text-[#a8a29e] text-xs">/</span>
              <span className="text-[#78716c] text-xs font-mono">
                AUTHENTICATED AS {currentUser.name.toUpperCase()} ({currentUser.role.toUpperCase()})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] font-serif tracking-tight">
              Agent Firewall Research Protocol
            </h1>

            <p className="text-sm font-medium text-[#2d4a3e]">
              “AI can act. AI cannot decide what it is allowed to do.”
            </p>

            <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl leading-relaxed">
              Verifiable trust infrastructure connecting sponsors, medical domain experts, and student researchers into access-controlled, legally-governed, and auditable collaborative research initiatives.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            {isSponsor && (
              <button
                onClick={() => onNavigateTab('projects_new')}
                className="px-4 py-2.5 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-[#e7e2d9]" />
                <span>+ Post New Initiative</span>
              </button>
            )}

            {isStudent && (
              <button
                onClick={() => onNavigateTab('projects')}
                className="px-4 py-2.5 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <span>Discover Open Initiatives</span>
                <ArrowRight className="w-4 h-4 text-[#e7e2d9]" />
              </button>
            )}

            {isAdmin && (
              <button
                onClick={onTriggerStarScene}
                className="px-4 py-2.5 bg-[#fbf0f1] hover:bg-[#f5e0e3] text-[#7a222b] border border-[#7a222b]/30 rounded text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Shield className="w-4 h-4 text-[#7a222b]" />
                <span>Execute Star Scene (Poisoned PDF)</span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab('simulator')}
              className="px-4 py-2 bg-[#f5f3ef] hover:bg-[#ede9e3] text-[#1c1917] border border-[#d6cebf] rounded text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Cpu className="w-4 h-4 text-[#78716c]" />
              <span>Policy Simulator</span>
            </button>
          </div>
        </div>

        {/* Visual Lifecycle Journey */}
        <div className="mt-8 pt-6 border-t border-[#e7e2d9]">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#78716c] mb-3 font-semibold">
            VERIFIABLE COLLABORATION JOURNEY
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs">
            {[
              { num: '01', title: 'CHARTER', sub: 'Governs terms' },
              { num: '02', title: 'MATCH', sub: 'Filters COI' },
              { num: '03', title: 'JOIN', sub: '2-step sign' },
              { num: '04', title: 'FUND', sub: 'Escrow HELD' },
              { num: '05', title: 'WORK', sub: 'Firewall receipts' },
              { num: '06', title: 'REVIEW', sub: 'Jaccard check' },
              { num: '07', title: 'SETTLE', sub: 'Priya ₹25,783' },
            ].map((step) => (
              <div
                key={step.title}
                className="bg-[#fbfaf8] border border-[#e7e2d9] p-3 rounded hover:border-[#d6cebf] transition-colors"
              >
                <div className="text-[10px] font-mono text-[#2d4a3e] font-bold mb-0.5">{step.num}</div>
                <div className="font-semibold text-[#1c1917] text-xs font-serif">{step.title}</div>
                <div className="text-[11px] text-[#78716c] mt-0.5">{step.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Firewall status */}
        <div className="bg-white border border-[#e7e2d9] rounded p-5 space-y-2">
          <div className="flex items-center justify-between text-[#78716c]">
            <span className="text-xs font-mono uppercase">FIREWALL ENFORCEMENT</span>
            <Shield className="w-4 h-4 text-[#2d4a3e]" />
          </div>
          <div className="text-xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <span>DETERMINISTIC</span>
            <span className="w-2 h-2 rounded-full bg-[#2d4a3e]"></span>
          </div>
          <p className="text-xs text-[#78716c] leading-relaxed">
            4-Stage Pipeline: Scope · Sensitivity · Injection · Side-Effects
          </p>
        </div>

        {/* Ledger integrity */}
        <div className="bg-white border border-[#e7e2d9] rounded p-5 space-y-2">
          <div className="flex items-center justify-between text-[#78716c]">
            <span className="text-xs font-mono uppercase">CRYPTOGRAPHIC LEDGER</span>
            <Database className="w-4 h-4 text-[#2d4a3e]" />
          </div>
          <div className="text-xl font-bold font-serif">
            {ledgerStatus?.valid ? (
              <span className="text-[#2d4a3e] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                VERIFIED (OK)
              </span>
            ) : (
              <span className="text-[#7a222b] flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" />
                INTEGRITY FAILED
              </span>
            )}
          </div>
          <p className="text-xs text-[#78716c] font-mono truncate">
            Head: {ledgerStatus?.head_hash ? `${ledgerStatus.head_hash.slice(0, 16)}...` : 'Verified'}
          </p>
        </div>

        {/* Multi-user Backend */}
        <div className="bg-white border border-[#e7e2d9] rounded p-5 space-y-2">
          <div className="flex items-center justify-between text-[#78716c]">
            <span className="text-xs font-mono uppercase">SHARED DATABASE</span>
            <Users className="w-4 h-4 text-[#2d4a3e]" />
          </div>
          <div className="text-xl font-bold text-[#1c1917] font-serif">
            <span>MULTI-USER ACTIVE</span>
          </div>
          <p className="text-xs text-[#78716c]">
            Real SQLite backend with server-authoritative RBAC
          </p>
        </div>

        {/* LLM Adapter */}
        <div className="bg-white border border-[#e7e2d9] rounded p-5 space-y-2">
          <div className="flex items-center justify-between text-[#78716c]">
            <span className="text-xs font-mono uppercase">LLM ADAPTER</span>
            <Cpu className="w-4 h-4 text-[#78716c]" />
          </div>
          <div className="text-xl font-bold text-[#1c1917] font-serif">
            <span>DETERMINISTIC MOCK</span>
          </div>
          <p className="text-xs text-[#78716c]">
            Tagged [MOCK] · 100% offline uptime for finals
          </p>
        </div>
      </div>

      {/* Primary Collaborative Research Initiatives */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1c1917] font-serif">Collaborative Research Initiatives</h2>
            <p className="text-xs text-[#78716c]">Real multi-user projects stored in shared backend database</p>
          </div>
          {isSponsor && (
            <button
              onClick={() => onNavigateTab('projects_new')}
              className="px-3.5 py-1.5 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-semibold cursor-pointer transition-colors"
            >
              + Create Initiative
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => {
            const isFunded = p.engagement_model === 'FUNDED';
            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className="bg-white border border-[#e7e2d9] hover:border-[#b8b0a2] rounded p-6 flex flex-col justify-between transition-all cursor-pointer group shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded border ${
                        isFunded
                          ? 'bg-[#eef3f0] text-[#2d4a3e] border-[#2d4a3e]/30'
                          : 'bg-[#f5f3ef] text-[#57534e] border-[#d6cebf]'
                      }`}
                    >
                      {p.engagement_model} MODEL
                    </span>
                    <span className="text-xs font-mono text-[#78716c] uppercase">{p.status}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#1c1917] font-serif group-hover:text-[#2d4a3e] transition-colors mb-2">
                    {p.title}
                  </h3>

                  <p className="text-xs text-[#57534e] line-clamp-3 mb-4 leading-relaxed font-sans">
                    {p.public_summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#e7e2d9] flex items-center justify-between text-xs font-mono">
                  <div>
                    {isFunded ? (
                      <div>
                        <span className="text-[#78716c] text-[11px]">Milestone Budget: </span>
                        <span className="text-[#2d4a3e] font-bold text-sm">
                          ₹{p.budget_inr.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[#78716c] text-[11px]">Academic Credit: </span>
                        <span className="text-[#1c1917] font-bold text-sm">
                          {p.credit_pool_cu} CU (NO PAYMENT)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-[#2d4a3e] font-sans font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open Initiative</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
