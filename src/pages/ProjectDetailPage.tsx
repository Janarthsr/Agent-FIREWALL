import React, { useState, useEffect } from 'react';
import { Project, User } from '../types';
import { api } from '../api';
import { Shield, FileText, Lock, Unlock, CheckCircle2, AlertCircle, Users, Coins, ArrowRight, UploadCloud, ChevronRight, Check } from 'lucide-react';

interface ProjectDetailPageProps {
  projectId: string;
  currentUser: User;
  onNavigateWorkspace: (projectId: string) => void;
  onRefreshData: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
  currentUser,
  onNavigateWorkspace,
  onRefreshData,
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Charter Acceptance State
  const [charterAccepted, setCharterAccepted] = useState(false);
  const [modelAcknowledged, setModelAcknowledged] = useState(false);
  const [acceptingCharter, setAcceptingCharter] = useState(false);
  const [charterSuccessMessage, setCharterSuccessMessage] = useState<string | null>(null);

  // Confidential Brief Access (Tiered Disclosure & 403 Test)
  const [briefContent, setBriefContent] = useState<string | null>(null);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  // Scoping & Matching States
  const [scopingLoading, setScopingLoading] = useState(false);
  const [matchingData, setMatchingData] = useState<any | null>(null);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [fundingLoading, setFundingLoading] = useState(false);

  // Document Upload State
  const [newDocName, setNewDocName] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getProject(projectId);
      setProject(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // Test Confidential Brief Access Control (HTTP 403 Test)
  const handleTestBriefAccess = async () => {
    setBriefLoading(true);
    setBriefError(null);
    setBriefContent(null);
    try {
      const res = await api.getConfidentialBrief(projectId, currentUser.id, currentUser.role);
      if (!res.ok || res.status === 403) {
        setBriefError('Access denied (HTTP 403) — Charter acceptance and model acknowledgement required.');
      } else {
        setBriefContent(res.data.brief);
      }
      onRefreshData();
    } catch (err: any) {
      setBriefError(err.message || 'Access denied');
    } finally {
      setBriefLoading(false);
    }
  };

  // Sign Charter & Join Initiative
  const handleSignCharter = async () => {
    if (!project?.charter) return;
    if (!charterAccepted || !modelAcknowledged) {
      alert('You must check both: accept the charter terms AND acknowledge the engagement model.');
      return;
    }
    setAcceptingCharter(true);
    try {
      await api.acceptCharter(project.charter.id, projectId, currentUser.id, project.charter.version, modelAcknowledged);
      setCharterSuccessMessage('Charter accepted and signed into cryptographic ledger. You are now an active member.');
      await fetchProjectDetails();
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAcceptingCharter(false);
    }
  };

  // Scoping Propose Milestones
  const handleProposeMilestones = async () => {
    setScopingLoading(true);
    try {
      await api.proposeMilestones(projectId, currentUser.id);
      await fetchProjectDetails();
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setScopingLoading(false);
    }
  };

  // Sponsor Accept Milestones
  const handleAcceptMilestones = async () => {
    setScopingLoading(true);
    try {
      await api.acceptMilestones(projectId, currentUser.id);
      await fetchProjectDetails();
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setScopingLoading(false);
    }
  };

  // Cohort Matcher & COI Filtering
  const handleComputeMatches = async () => {
    setMatchingLoading(true);
    try {
      const res = await api.getMatches(projectId, currentUser.id);
      setMatchingData(res.matches);
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setMatchingLoading(false);
    }
  };

  // Fund Milestone 1 Escrow (transitions to HELD)
  const handleFundMilestone1 = async () => {
    if (!project?.milestones || project.milestones.length === 0) return;
    setFundingLoading(true);
    try {
      const m1 = project.milestones[0];
      await api.fundMilestone(m1.id, projectId, m1.allocated_amount_inr || 35000, currentUser.id);
      await fetchProjectDetails();
      onRefreshData();
      alert(`Milestone 1 funded: Escrow state transitioned to HELD (₹${(m1.allocated_amount_inr || 35000).toLocaleString()}).`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFundingLoading(false);
    }
  };

  // Upload Project Document
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    setUploadingDoc(true);
    try {
      const doc = {
        name: newDocName.trim(),
        size: '2.1 MB',
        type: 'Clinical Document',
        uploaded_at: new Date().toISOString(),
      };
      await api.uploadDocument(projectId, doc, currentUser.id);
      setNewDocName('');
      await fetchProjectDetails();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploadingDoc(false);
    }
  };

  if (loading || !project) {
    return <div className="text-center py-16 text-[#78716c] font-mono text-xs">Loading initiative specification...</div>;
  }

  const isFunded = project.engagement_model === 'FUNDED';
  const isKnowledge = project.engagement_model === 'KNOWLEDGE';
  const isSponsor = currentUser.role === 'sponsor' || currentUser.role === 'admin';
  const isMember = project.members?.some((m) => m.user_id === currentUser.id);

  return (
    <div className="space-y-8">
      {/* Initiative Overview Card */}
      <div className="bg-white border border-[#e7e2d9] rounded p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-mono font-semibold px-3 py-1 rounded border ${
                isFunded
                  ? 'bg-[#eef3f0] text-[#2d4a3e] border-[#2d4a3e]/30'
                  : 'bg-[#eff6ff] text-[#1e3a8a] border-[#1e3a8a]/30'
              }`}
            >
              {project.engagement_model} ENGAGEMENT MODEL
            </span>

            {isKnowledge && (
              <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-[#f5f3ef] text-[#57534e] rounded border border-[#e7e2d9]">
                ZERO FIAT (CREDIT UNITS ONLY)
              </span>
            )}

            <span className="text-xs font-mono text-[#78716c] uppercase px-2 py-1 bg-[#f5f3ef] rounded border border-[#e7e2d9]">
              STATUS: {project.status}
            </span>

            {isMember && (
              <span className="text-xs font-mono font-semibold text-[#2d4a3e] bg-[#eef3f0] px-2.5 py-1 rounded border border-[#2d4a3e]/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ACTIVE MEMBER
              </span>
            )}
          </div>

          <button
            onClick={() => onNavigateWorkspace(project.id)}
            className="px-4 py-2 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <span>Enter Research Workspace</span>
            <ArrowRight className="w-4 h-4 text-[#e7e2d9]" />
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] font-serif mb-2">{project.title}</h1>

        {project.problem_statement && (
          <div className="mb-3 p-3 bg-[#f5f3ef] border-l-2 border-[#2d4a3e] text-xs text-[#2d4a3e] font-serif italic">
            “{project.problem_statement}”
          </div>
        )}

        <p className="text-xs sm:text-sm text-[#57534e] max-w-3xl leading-relaxed mb-6">{project.public_summary}</p>

        {/* Budget / Credit metadata bar */}
        <div className="pt-4 border-t border-[#e7e2d9] flex flex-wrap items-center gap-6 text-xs font-mono">
          <div>
            <span className="text-[#78716c]">Security Sensitivity: </span>
            <span className="text-[#854d0e] font-bold">{project.sensitivity}</span>
          </div>

          <div>
            {isFunded ? (
              <div>
                <span className="text-[#78716c]">Escrow Milestone Budget: </span>
                <span className="text-[#2d4a3e] font-bold text-sm">₹{project.budget_inr.toLocaleString()}</span>
              </div>
            ) : (
              <div>
                <span className="text-[#78716c]">Academic Recognition Pool: </span>
                <span className="text-[#1e3a8a] font-bold text-sm">{project.credit_pool_cu} CU (CITATIONS & BADGES)</span>
              </div>
            )}
          </div>

          <div>
            <span className="text-[#78716c]">Charter Version: </span>
            <span className="text-[#1c1917] font-bold">v{project.charter?.version || '1.0'}</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Charter Acceptance & Tiered Disclosure (Confidential Brief 403 Test) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Project Charter & Acceptance Flow */}
        <div className="bg-white border border-[#e7e2d9] rounded p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2d4a3e]" />
                <h2 className="text-sm font-bold text-[#1c1917] uppercase tracking-wider font-mono">
                  Project Charter Agreement (v{project.charter?.version || '1.0'})
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#78716c]">PRE-EXECUTION TRUST CONTRACT</span>
            </div>

            <div className="bg-[#fbfaf8] border border-[#e7e2d9] rounded p-4 text-xs font-mono text-[#44403c] whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto mb-4 scrollbar-thin">
              {project.charter?.content_text}
            </div>

            {charterSuccessMessage && (
              <div className="p-3 bg-[#eef3f0] border border-[#2d4a3e]/30 rounded text-xs text-[#2d4a3e] flex items-center gap-2 mb-4 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#2d4a3e] shrink-0" />
                <span>{charterSuccessMessage}</span>
              </div>
            )}

            {/* 2-Step Acceptance Checkboxes */}
            <div className="space-y-3 p-3.5 bg-[#f5f3ef] border border-[#e7e2d9] rounded mb-4">
              <label className="flex items-start gap-2.5 text-xs text-[#44403c] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={charterAccepted || isMember}
                  disabled={isMember}
                  onChange={(e) => setCharterAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-[#d6cebf] text-[#2d4a3e]"
                />
                <span>
                  <strong>1. Charter Terms Acceptance:</strong> I accept Charter v{project.charter?.version || '1.0'}, intellectual property allocation, and acceptance criteria.
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-[#44403c] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={modelAcknowledged || isMember}
                  disabled={isMember}
                  onChange={(e) => setModelAcknowledged(e.target.checked)}
                  className="mt-0.5 rounded border-[#d6cebf] text-[#2d4a3e]"
                />
                <span>
                  <strong>2. Engagement Model Acknowledgment:</strong> I explicitly acknowledge this is a{' '}
                  <span className="text-[#2d4a3e] font-bold">{project.engagement_model}</span> engagement.
                  {isKnowledge && ' (Zero monetary payment; recognition strictly in CU, certificate, and publication attribution).'}
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={handleSignCharter}
            disabled={acceptingCharter || isMember}
            className={`w-full py-2.5 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
              isMember
                ? 'bg-[#eef3f0] text-[#2d4a3e] border border-[#2d4a3e]/30 cursor-default'
                : 'bg-[#2d4a3e] hover:bg-[#233a31] text-white cursor-pointer'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>
              {isMember
                ? 'Charter Signed & Active Contributor'
                : acceptingCharter
                ? 'Signing into Cryptographic Ledger...'
                : 'Accept Charter & Join Initiative'}
            </span>
          </button>
        </div>

        {/* Right: Tiered Disclosure & Confidential Brief 403 Test */}
        <div className="bg-white border border-[#e7e2d9] rounded p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#854d0e]" />
                <h2 className="text-sm font-bold text-[#1c1917] uppercase tracking-wider font-mono">
                  Tiered Disclosure · Confidential Brief Access
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#854d0e] bg-[#fef9ee] px-2 py-0.5 rounded border border-[#854d0e]/30">
                RBAC PROTECTED
              </span>
            </div>

            <p className="text-xs text-[#57534e] mb-4 leading-relaxed">
              Tiered disclosure protects proprietary research. Unsigned non-members receive an HTTP 403 Forbidden and trigger a <code className="text-[#7a222b] font-mono">BRIEF_ACCESS_DENIED</code> ledger entry.
            </p>

            <div className="min-h-[140px] bg-[#fbfaf8] border border-[#e7e2d9] rounded p-4 flex flex-col justify-center items-center text-center mb-4">
              {briefLoading && <div className="text-xs font-mono text-[#78716c]">Evaluating security policy...</div>}

              {briefError && (
                <div className="text-left w-full space-y-2">
                  <div className="flex items-center gap-2 text-[#7a222b] text-xs font-bold font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>HTTP 403 FORBIDDEN</span>
                  </div>
                  <div className="text-xs text-[#7a222b] bg-[#fbf0f1] p-2.5 rounded border border-[#7a222b]/30 font-mono">
                    “{briefError}”
                  </div>
                  <div className="text-[11px] text-[#78716c] font-mono">
                    Security Event: <span className="text-[#7a222b] font-bold">BRIEF_ACCESS_DENIED</span> recorded on ledger.
                  </div>
                </div>
              )}

              {briefContent && (
                <div className="text-left w-full space-y-2">
                  <div className="flex items-center gap-2 text-[#2d4a3e] text-xs font-bold font-mono">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>ACCESS GRANTED (HTTP 200 OK)</span>
                  </div>
                  <div className="text-xs text-[#1c1917] bg-[#eef3f0] p-2.5 rounded border border-[#2d4a3e]/30 font-mono leading-relaxed">
                    {briefContent}
                  </div>
                  <div className="text-[11px] text-[#78716c] font-mono">
                    Security Event: <span className="text-[#2d4a3e] font-bold">BRIEF_ACCESS_ALLOWED</span> recorded on ledger.
                  </div>
                </div>
              )}

              {!briefLoading && !briefError && !briefContent && (
                <div className="text-xs text-[#78716c] font-mono space-y-1">
                  <div>Confidential brief encrypted.</div>
                  <div className="text-[11px] text-[#a8a29e]">Click below to test access control matrix.</div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleTestBriefAccess}
            disabled={briefLoading}
            className="w-full py-2.5 bg-[#f5f3ef] hover:bg-[#ede9e3] text-[#1c1917] border border-[#d6cebf] rounded text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-[#78716c]" />
            <span>Test Brief Access as {currentUser.name}</span>
          </button>
        </div>

      </div>

      {/* Active Project Members Roster (Section 4 & Section 5) */}
      <div className="bg-white border border-[#e7e2d9] rounded p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e7e2d9]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#2d4a3e]" />
            <h2 className="text-sm font-bold text-[#1c1917] uppercase tracking-wider font-mono">
              Active Project Members ({project.members?.length || 0})
            </h2>
          </div>
          <span className="text-xs font-mono text-[#78716c]">SHARED MULTI-USER STATE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {project.members && project.members.length > 0 ? (
            project.members.map((m) => (
              <div key={m.id} className="p-4 bg-[#fbfaf8] border border-[#e7e2d9] rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#2d4a3e] bg-[#eef3f0] px-2 py-0.5 rounded border border-[#2d4a3e]/20">
                    {m.role}
                  </span>
                  <span className="text-[10px] font-mono text-[#78716c]">
                    WT: {m.weight}
                  </span>
                </div>
                <div className="font-semibold text-xs text-[#1c1917]">{m.name || m.user_id}</div>
                <div className="text-[11px] text-[#78716c] font-mono truncate">{m.email}</div>
                <div className="text-[10px] font-mono text-[#2d4a3e] pt-1 border-t border-[#e7e2d9]">
                  STATUS: {m.status}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-xs font-mono text-[#78716c] text-center py-4">
              No members enrolled yet.
            </div>
          )}
        </div>
      </div>

      {/* Project Documents Section (Section 6) */}
      <div className="bg-white border border-[#e7e2d9] rounded p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e7e2d9]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2d4a3e]" />
            <h2 className="text-sm font-bold text-[#1c1917] uppercase tracking-wider font-mono">
              Project Research Documents & Protocols ({project.documents?.length || 0})
            </h2>
          </div>
          <span className="text-xs font-mono text-[#78716c]">DOCUMENTS ARE DATA, NEVER INSTRUCTIONS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.documents?.map((doc, idx) => (
            <div key={idx} className="p-4 bg-[#fbfaf8] border border-[#e7e2d9] rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#2d4a3e] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#1c1917] font-mono">{doc.name}</div>
                  <div className="text-[11px] text-[#78716c]">{doc.type || 'Research Spec'} · {doc.size}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-[#eef3f0] text-[#2d4a3e] px-2 py-0.5 rounded font-semibold border border-[#2d4a3e]/20">
                VERIFIED
              </span>
            </div>
          ))}
        </div>

        {isSponsor && (
          <form onSubmit={handleUploadDocument} className="pt-2 flex gap-2">
            <input
              type="text"
              placeholder="Attach additional document (e.g. apollo_retinopathy_protocol_v2.pdf)..."
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              className="flex-1 bg-[#fbfaf8] border border-[#d6cebf] rounded px-3 py-2 text-xs text-[#1c1917]"
            />
            <button
              type="submit"
              disabled={uploadingDoc}
              className="px-4 py-2 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-semibold cursor-pointer shrink-0"
            >
              {uploadingDoc ? 'Uploading...' : '+ Upload Document'}
            </button>
          </form>
        )}
      </div>

      {/* Scoping & Milestones Section */}
      <div className="bg-white border border-[#e7e2d9] rounded p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e7e2d9]">
          <div>
            <h2 className="text-sm font-bold text-[#1c1917] uppercase tracking-wider font-mono flex items-center gap-2">
              <span>Deterministic Scoping Agent & Milestones</span>
              <span className="text-[10px] font-mono bg-[#eff6ff] text-[#1e3a8a] px-1.5 py-0.5 rounded border border-[#1e3a8a]/30">[MOCK]</span>
            </h2>
            <p className="text-xs text-[#57534e]">Scoping agent proposes work breakdown and acceptance criteria for sponsor review</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleProposeMilestones}
              disabled={scopingLoading}
              className="px-3 py-1.5 bg-[#f5f3ef] hover:bg-[#ede9e3] text-[#1c1917] border border-[#d6cebf] rounded text-xs font-medium cursor-pointer transition-colors"
            >
              Propose Milestones
            </button>
            {isSponsor && (
              <button
                onClick={handleAcceptMilestones}
                disabled={scopingLoading}
                className="px-3 py-1.5 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-medium cursor-pointer transition-colors"
              >
                Accept Milestones (Log to Ledger)
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {project.milestones?.map((m) => (
            <div key={m.id} className="bg-[#fbfaf8] border border-[#e7e2d9] rounded p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono text-[#2d4a3e] font-bold uppercase">
                    STAGE 0{m.order_index}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                      m.escrow_state === 'HELD'
                        ? 'bg-[#fef9ee] text-[#854d0e] border-[#854d0e]/30'
                        : m.escrow_state === 'SETTLED'
                        ? 'bg-[#eef3f0] text-[#2d4a3e] border-[#2d4a3e]/30'
                        : 'bg-[#f5f3ef] text-[#78716c] border-[#e7e2d9]'
                    }`}
                  >
                    ESCROW: {m.escrow_state}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#1c1917] mb-1.5">{m.title}</h3>
                <p className="text-[11px] text-[#57534e] line-clamp-3 mb-3">{m.description}</p>
                <div className="text-[11px] text-[#78716c] bg-white p-2 rounded border border-[#e7e2d9] mb-3 font-mono">
                  <span className="font-semibold text-[#1c1917]">Criteria: </span>
                  {m.acceptance_criteria}
                </div>
              </div>

              {isFunded && (
                <div className="pt-2 border-t border-[#e7e2d9] flex items-center justify-between text-xs">
                  <span className="text-[#78716c] font-mono">Allocated: ₹{m.allocated_amount_inr?.toLocaleString()}</span>
                  {m.order_index === 1 && m.escrow_state === 'UNFUNDED' && isSponsor && (
                    <button
                      onClick={handleFundMilestone1}
                      disabled={fundingLoading}
                      className="px-2.5 py-1 bg-[#854d0e] hover:bg-[#713f12] text-white rounded text-[11px] font-semibold cursor-pointer transition-colors"
                    >
                      Fund Escrow (HELD)
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cohort Matching & COI Filter Section */}
      <div className="bg-white border border-[#e7e2d9] rounded p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e7e2d9]">
          <div>
            <h2 className="text-sm font-bold text-[#1c1917] uppercase tracking-wider font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2d4a3e]" />
              <span>Cohort Matching & Conflict of Interest (COI) Filtering</span>
            </h2>
            <p className="text-xs text-[#57534e]">Recommends 1 expert + 3 students and excludes conflicted candidates</p>
          </div>

          <button
            onClick={handleComputeMatches}
            disabled={matchingLoading}
            className="px-3.5 py-1.5 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-semibold cursor-pointer transition-colors self-start sm:self-auto"
          >
            {matchingLoading ? 'Computing...' : 'Run Matcher Engine'}
          </button>
        </div>

        {matchingData ? (
          <div className="space-y-4">
            {/* COI Filter Alert */}
            <div className="p-4 bg-[#fbf0f1] border border-[#7a222b]/30 rounded flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#7a222b] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold font-mono text-[#7a222b] uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span>COI FILTERED (EXPERT CANDIDATE REJECTED)</span>
                  <span className="bg-[#7a222b] text-white px-1.5 py-0.5 rounded text-[10px]">RULE ENFORCED</span>
                </div>
                <div className="text-xs font-semibold text-[#1c1917]">{matchingData.coi_filtered?.name} ({matchingData.coi_filtered?.title})</div>
                <p className="text-xs text-[#7a222b] mt-1">{matchingData.coi_filtered?.coi_reason}</p>
                <div className="text-[11px] font-mono text-[#78716c] mt-2">
                  Ledger Action: <span className="text-[#7a222b] font-bold">COI_FILTERED</span> recorded with BLOCK decision.
                </div>
              </div>
            </div>

            {/* Recommended Expert & Students */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Expert */}
              {matchingData.expert && (
                <div className="bg-[#fbfaf8] border border-[#2d4a3e]/30 rounded p-4">
                  <div className="text-[10px] font-mono text-[#2d4a3e] font-bold uppercase mb-1">
                    RECOMMENDED LEAD EXPERT (FIT: {matchingData.expert.score}%)
                  </div>
                  <div className="text-xs font-bold text-[#1c1917] mb-0.5">{matchingData.expert.name}</div>
                  <div className="text-[11px] text-[#57534e] mb-2">{matchingData.expert.title}</div>
                  <ul className="text-[11px] text-[#57534e] space-y-1 list-disc list-inside">
                    {matchingData.expert.reasons?.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Students */}
              {matchingData.students?.map((stu: any) => (
                <div key={stu.id} className="bg-[#fbfaf8] border border-[#e7e2d9] rounded p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-[#78716c] font-bold uppercase">
                      STUDENT RESEARCHER
                    </span>
                    <span className="text-[10px] font-mono text-[#2d4a3e] font-bold">
                      WEIGHT: {stu.weight}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#1c1917] mb-0.5">{stu.name}</div>
                  <div className="text-[11px] text-[#57534e] mb-2">{stu.title}</div>
                  <ul className="text-[11px] text-[#57534e] space-y-1 list-disc list-inside">
                    {stu.reasons?.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-[#fbfaf8] rounded border border-[#e7e2d9] text-xs text-[#78716c] font-mono">
            Click 'Run Matcher Engine' to recommend 1 verified expert and 3 students while enforcing Conflict-of-Interest filters.
          </div>
        )}
      </div>

    </div>
  );
};
