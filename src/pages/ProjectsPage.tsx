import React, { useState } from 'react';
import { Project, User, EngagementModel } from '../types';
import { api } from '../api';
import { PlusCircle, FileText, ArrowRight, Shield, Coins, AlertCircle, UploadCloud, CheckCircle2, Layers, BookOpen, Clock } from 'lucide-react';

interface ProjectsPageProps {
  projects: Project[];
  currentUser: User;
  onSelectProject: (projectId: string) => void;
  onRefreshProjects: () => void;
  startInCreateMode?: boolean;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  currentUser,
  onSelectProject,
  onRefreshProjects,
  startInCreateMode = false,
}) => {
  const [showCreate, setShowCreate] = useState(startInCreateMode);
  const [filterModel, setFilterModel] = useState<'ALL' | 'FUNDED' | 'KNOWLEDGE'>('ALL');

  // Sponsor Project Creation Form State (Section 6)
  const [step, setStep] = useState<number>(1);
  const [title, setTitle] = useState('Automated Diabetic Retinopathy Screening');
  const [problemStatement, setProblemStatement] = useState(
    'Early clinical detection of Diabetic Retinopathy (DR) in high-volume triage clinics requires automated, deterministic screening pipelines supervised by credentialed ophthalmologists.'
  );
  const [publicSummary, setPublicSummary] = useState(
    'A collaborative clinical-engineering initiative validating Vision Transformer architectures for zero-loss fundus photography triage across patient cohorts.'
  );
  const [confidentialBrief, setConfidentialBrief] = useState(
    'Proprietary Apollo Retinal Hospital network raw feature embeddings, clinical diagnostic notes, and expert ground-truth lesion segmentations. Prohibited from cloud inference or external exfiltration.'
  );
  const [sensitivity, setSensitivity] = useState('CONFIDENTIAL');
  const [engagementModel, setEngagementModel] = useState<EngagementModel>('FUNDED');
  const [budgetInr, setBudgetInr] = useState(100000);
  const [creditPoolCu, setCreditPoolCu] = useState(100);
  const [charterText, setCharterText] = useState(
    `CHARTER AGREEMENT v1.0
1. Engagement Model: FUNDED (Milestone Escrow Disbursement)
2. Roles: Sponsor funds; Lead Expert peer-reviews; Student researchers develop.
3. Intellectual Property: Sponsor receives commercial license; Contributors retain academic publication rights.
4. AI Attribution: AI tools earn ₹0. All intellectual contributions credited to directing humans.
5. Exit & Clawback: Failure to meet milestone criteria forfeits weighted pool; verified baseline time is protected.`
  );
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ name: string; size: string; type: string; uploaded_at: string }>>([
    {
      name: 'diabetic-retinopathy-screening-protocol-v1.pdf',
      size: '2.4 MB',
      type: 'Clinical Protocol',
      uploaded_at: new Date().toISOString(),
    },
  ]);
  const [newDocName, setNewDocName] = useState('');
  const [creating, setCreating] = useState(false);

  // Milestones State
  const [milestones, setMilestones] = useState([
    {
      title: 'Stage 1: Dataset & Literature Pipeline',
      description: 'Preprocess fundus photography datasets and establish baseline classification protocol.',
      acceptance_criteria: 'Reproducible preprocessing notebook and verified clinical baseline report',
      allocated_amount_inr: 35000,
    },
    {
      title: 'Stage 2: Model Training & Evaluation',
      description: 'Train Vision Transformer (ViT) architecture and compute ROC-AUC and sensitivity metrics.',
      acceptance_criteria: 'ROC-AUC >= 0.85 across 5-fold stratified cross-validation',
      allocated_amount_inr: 45000,
    },
    {
      title: 'Stage 3: Peer Audit & Clinical Validation',
      description: 'Domain expert peer audit, clinical edge-case review, and final deliverable package.',
      acceptance_criteria: 'Expert review approval score >= 85 and clean similarity verification',
      allocated_amount_inr: 20000,
    },
  ]);

  const handleAddSampleDoc = () => {
    const doc = {
      name: 'apollo_retinal_validation_cohort.csv',
      size: '480 KB',
      type: 'Hospital Cohort Ground Truth',
      uploaded_at: new Date().toISOString(),
    };
    if (!uploadedDocs.some((d) => d.name === doc.name)) {
      setUploadedDocs([...uploadedDocs, doc]);
    }
  };

  const handleAddCustomDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    setUploadedDocs([
      ...uploadedDocs,
      {
        name: newDocName.trim(),
        size: '1.2 MB',
        type: 'Research Specification Document',
        uploaded_at: new Date().toISOString(),
      },
    ]);
    setNewDocName('');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.createProject({
        title,
        problem_statement: problemStatement,
        public_summary: publicSummary,
        confidential_brief: confidentialBrief,
        sensitivity,
        engagement_model: engagementModel,
        budget_inr: engagementModel === 'KNOWLEDGE' ? 0 : budgetInr,
        credit_pool_cu: engagementModel === 'KNOWLEDGE' ? creditPoolCu : 0,
        sponsor_id: currentUser.id,
        status: 'PUBLISHED',
        charter_text: charterText,
        documents: uploadedDocs,
        milestones: milestones,
      });

      alert('Initiative published to shared backend and anchored to cryptographic ledger.');
      setShowCreate(false);
      onRefreshProjects();
      if (res.project_id) {
        onSelectProject(res.project_id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const isSponsorOrAdmin = currentUser.role === 'sponsor' || currentUser.role === 'admin';

  const filteredProjects = projects.filter((p) => {
    if (filterModel === 'ALL') return true;
    return p.engagement_model === filterModel;
  });

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="bg-white border border-[#e7e2d9] rounded p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs">
              <span className="text-[#2d4a3e] font-semibold bg-[#eef3f0] px-2.5 py-0.5 rounded border border-[#2d4a3e]/30 uppercase tracking-wider">
                INITIATIVE PORTFOLIO
              </span>
              <span className="text-[#a8a29e]">/</span>
              <span className="text-[#78716c]">SHARED MULTI-USER REGISTRY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] font-serif tracking-tight mb-2">
              Collaborative Research Initiatives
            </h1>
            <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl leading-relaxed">
              Discover active research initiatives governed by pre-execution Charters. Review terms, accept the charter to unlock confidential briefs, and collaborate with verified security enforcement.
            </p>
          </div>

          {isSponsorOrAdmin && (
            <button
              onClick={() => {
                setShowCreate(!showCreate);
                setStep(1);
              }}
              className="px-4 py-2.5 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-semibold cursor-pointer transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-[#e7e2d9]" />
              <span>{showCreate ? 'Close Form' : '+ Post New Initiative'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sponsor Project Creation Wizard (Section 6) */}
      {showCreate && (
        <div className="bg-white border border-[#2d4a3e]/30 rounded p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e7e2d9]">
            <div>
              <span className="text-[11px] font-mono uppercase text-[#2d4a3e] font-bold tracking-widest bg-[#eef3f0] px-2 py-0.5 rounded border border-[#2d4a3e]/20">
                SPONSOR WORKFLOW · STEP {step} OF 4
              </span>
              <h2 className="text-xl font-bold text-[#1c1917] font-serif mt-1">
                Create & Publish Research Initiative
              </h2>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              {[1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs cursor-pointer ${
                    step === s
                      ? 'bg-[#2d4a3e] text-white'
                      : 'bg-[#f5f3ef] text-[#78716c] hover:bg-[#ede9e3]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateProject} className="space-y-6">
            {/* Step 1: Project Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-xs font-mono text-[#78716c] uppercase tracking-wider font-semibold">
                  1. PROJECT INFORMATION & PROBLEM STATEMENT
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#78716c] mb-1 font-medium">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Automated Diabetic Retinopathy Screening"
                    className="w-full bg-[#fbfaf8] border border-[#d6cebf] rounded px-3 py-2 text-xs text-[#1c1917] focus:outline-none focus:border-[#2d4a3e] font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#78716c] mb-1 font-medium">
                    Problem Statement
                  </label>
                  <textarea
                    rows={2}
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    placeholder="Describe the research problem to be solved..."
                    className="w-full bg-[#fbfaf8] border border-[#d6cebf] rounded px-3 py-2 text-xs text-[#1c1917] focus:outline-none focus:border-[#2d4a3e]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#78716c] mb-1 font-medium">
                      Engagement Model
                    </label>
                    <select
                      value={engagementModel}
                      onChange={(e: any) => setEngagementModel(e.target.value)}
                      className="w-full bg-[#fbfaf8] border border-[#d6cebf] rounded px-3 py-2 text-xs text-[#1c1917] font-semibold"
                    >
                      <option value="FUNDED">FUNDED (Milestone Escrow Payout)</option>
                      <option value="KNOWLEDGE">KNOWLEDGE (Pure Academic CU - Zero ₹)</option>
                      <option value="STIPEND">STIPEND (Fixed Base Split)</option>
                      <option value="INSTITUTIONAL">INSTITUTIONAL (Grant-Based)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#78716c] mb-1 font-medium">
                      Security Sensitivity Classification
                    </label>
                    <select
                      value={sensitivity}
                      onChange={(e) => setSensitivity(e.target.value)}
                      className="w-full bg-[#fbfaf8] border border-[#d6cebf] rounded px-3 py-2 text-xs text-[#854d0e] font-semibold"
                    >
                      <option value="CONFIDENTIAL">CONFIDENTIAL (Local Execution Only · RBAC Gated)</option>
                      <option value="PUBLIC">PUBLIC (Open Science Access)</option>
                    </select>
                  </div>
                </div>

                {engagementModel !== 'KNOWLEDGE' ? (
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#78716c] mb-1 font-medium">
                      Escrow Budget (₹ INR)
                    </label>
                    <input
                      type="number"
                      value={budgetInr}
                      onChange={(e) => setBudgetInr(Number(e.target.value))}
                      className="w-full bg-[#fbfaf8] border border-[#d6cebf] rounded px-3 py-2 text-xs text-[#2d4a3e] font-mono font-bold"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#78716c] mb-1 font-medium">
                      Academic Recognition Pool (Contribution Units)
                    </label>
                    <input
                      type="number"
                      value={creditPoolCu}
                      onChange={(e) => setCreditPoolCu(Number(e.target.value))}
                      className="w-full bg-[#fbfaf8] border border-[#d6cebf] rounded px-3 py-2 text-xs text-[#1e3a8a] font-mono font-bold"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono uppercase text-[#78716c] mb-1 font-medium">
                    Public Summary (Discoverable by Students & Experts)
                  </label>
                  <textarea
                    rows={2}
                    value={publicSummary}
                    onChange={(e) => setPublicSummary(e.target.value)}
                    className="w-full bg-[#fbfaf8] border border-[#d6cebf] rounded px-3 py-2 text-xs text-[#1c1917]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#854d0e] mb-1 font-medium flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#854d0e]" />
                    <span>Confidential Brief (Locked until Charter Acceptance)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={confidentialBrief}
                    onChange={(e) => setConfidentialBrief(e.target.value)}
                    className="w-full bg-[#fbfaf8] border border-[#d6cebf] rounded px-3 py-2 text-xs font-mono text-[#1c1917]"
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    Next: Upload Documents →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Project Documents */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-xs font-mono text-[#78716c] uppercase tracking-wider font-semibold">
                  2. PROJECT DOCUMENTS & RESEARCH ATTACHMENTS
                </div>

                <p className="text-xs text-[#57534e]">
                  Upload confidential study specifications, clinical protocols, or ground truth datasets for contributor access upon charter signoff.
                </p>

                <div className="p-4 bg-[#f5f3ef] border border-[#e7e2d9] rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1c1917]">Attached Documents ({uploadedDocs.length})</span>
                    <button
                      type="button"
                      onClick={handleAddSampleDoc}
                      className="text-xs text-[#2d4a3e] hover:underline cursor-pointer font-medium"
                    >
                      + Attach Apollo Hospital Validation Cohort
                    </button>
                  </div>

                  <div className="space-y-2">
                    {uploadedDocs.map((doc, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-white border border-[#e7e2d9] rounded flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#2d4a3e]" />
                          <div>
                            <div className="font-semibold text-[#1c1917] font-mono">{doc.name}</div>
                            <div className="text-[10px] text-[#78716c]">{doc.type} · {doc.size}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-[#2d4a3e] font-semibold bg-[#eef3f0] px-2 py-0.5 rounded">
                          ATTACHED
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. fundus_screening_spec_v2.pdf"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="flex-1 bg-white border border-[#d6cebf] rounded px-3 py-1.5 text-xs text-[#1c1917]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomDoc}
                      className="px-3 py-1.5 bg-[#ede9e3] hover:bg-[#e0d9ce] text-[#1c1917] rounded text-xs font-medium cursor-pointer"
                    >
                      Attach
                    </button>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-[#d6cebf] rounded text-xs text-[#57534e] hover:text-[#1c1917] cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    Next: Configure Charter →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Charter Configuration */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-xs font-mono text-[#78716c] uppercase tracking-wider font-semibold">
                  3. CONFIGURE CHARTER TERMS (PRE-EXECUTION TRUST CONTRACT)
                </div>

                <p className="text-xs text-[#57534e]">
                  The Charter establishes governance, IP retention, and AI tool rules before execution begins.
                </p>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#78716c] mb-1 font-medium">
                    Charter Agreement Text (v1.0)
                  </label>
                  <textarea
                    rows={6}
                    value={charterText}
                    onChange={(e) => setCharterText(e.target.value)}
                    className="w-full bg-[#fbfaf8] border border-[#d6cebf] rounded px-3 py-2 text-xs font-mono text-[#1c1917] leading-relaxed"
                    required
                  />
                </div>

                <div className="p-3 bg-[#f5f3ef] border border-[#e7e2d9] rounded text-xs space-y-1.5 font-mono text-[#57534e]">
                  <div className="font-bold text-[#1c1917]">Immutable Charter Rules:</div>
                  <div>• Rule 1: AI tools receive ₹0 fiat allocation. Human contributors receive 100% of the pool.</div>
                  <div>• Rule 2: Charter must be acknowledged before access to confidential material is granted.</div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 border border-[#d6cebf] rounded text-xs text-[#57534e] hover:text-[#1c1917] cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-4 py-2 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    Next: Configure Milestones →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Milestones & Final Publish */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="text-xs font-mono text-[#78716c] uppercase tracking-wider font-semibold">
                  4. MILESTONES & FINAL PUBLICATION
                </div>

                <div className="space-y-3">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="p-4 bg-[#fbfaf8] border border-[#e7e2d9] rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-[#2d4a3e]">STAGE 0{idx + 1}</span>
                        <span className="font-mono text-xs font-bold text-[#1c1917]">
                          ₹{m.allocated_amount_inr.toLocaleString()}
                        </span>
                      </div>
                      <div className="font-semibold text-xs text-[#1c1917]">{m.title}</div>
                      <div className="text-xs text-[#57534e]">{m.description}</div>
                      <div className="text-[11px] font-mono text-[#78716c] pt-1 border-t border-[#e7e2d9]">
                        Criteria: {m.acceptance_criteria}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-[#e7e2d9]">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 border border-[#d6cebf] rounded text-xs text-[#57534e] hover:text-[#1c1917] cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2.5 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-bold cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                  >
                    {creating ? 'Publishing to Ledger...' : 'Publish Initiative to Shared Registry'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-[#e7e2d9] pb-3 text-xs">
        <div className="flex items-center gap-2">
          {(['ALL', 'FUNDED', 'KNOWLEDGE'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFilterModel(m)}
              className={`px-3 py-1.5 rounded font-mono text-xs cursor-pointer transition-colors ${
                filterModel === m
                  ? 'bg-[#2d4a3e] text-white font-semibold'
                  : 'bg-[#f5f3ef] text-[#57534e] hover:text-[#1c1917]'
              }`}
            >
              {m === 'ALL' ? 'All Initiatives' : m === 'FUNDED' ? 'Funded (₹ Escrow)' : 'Knowledge (Academic CU)'}
            </button>
          ))}
        </div>
        <div className="text-[#78716c] font-mono text-xs hidden sm:block">
          {filteredProjects.length} INITIATIVES IN DATABASE
        </div>
      </div>

      {/* Initiatives Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((p) => {
          const isFunded = p.engagement_model === 'FUNDED';
          const isKnowledge = p.engagement_model === 'KNOWLEDGE';
          const isJoined = p.members?.some((m) => m.user_id === currentUser.id);

          return (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className="bg-white border border-[#e7e2d9] hover:border-[#2d4a3e]/50 rounded p-6 flex flex-col justify-between transition-all cursor-pointer group shadow-xs hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded border ${
                        isFunded
                          ? 'bg-[#eef3f0] text-[#2d4a3e] border-[#2d4a3e]/30'
                          : 'bg-[#eff6ff] text-[#1e3a8a] border-[#1e3a8a]/30'
                      }`}
                    >
                      {p.engagement_model} MODEL
                    </span>
                    {isKnowledge && (
                      <span className="text-[10px] font-mono bg-[#f5f3ef] text-[#57534e] px-2 py-0.5 rounded border border-[#e7e2d9]">
                        ZERO FIAT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isJoined && (
                      <span className="text-[10px] font-mono font-semibold text-[#2d4a3e] bg-[#eef3f0] px-2 py-0.5 rounded flex items-center gap-1 border border-[#2d4a3e]/20">
                        <CheckCircle2 className="w-3 h-3 text-[#2d4a3e]" />
                        JOINED
                      </span>
                    )}
                    <span className="text-xs font-mono text-[#78716c] uppercase">{p.status}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#1c1917] font-serif group-hover:text-[#2d4a3e] transition-colors mb-2">
                  {p.title}
                </h3>

                {p.problem_statement && (
                  <p className="text-xs font-medium text-[#2d4a3e] line-clamp-2 mb-2 italic">
                    “{p.problem_statement}”
                  </p>
                )}

                <p className="text-xs text-[#57534e] line-clamp-3 mb-4 leading-relaxed">
                  {p.public_summary}
                </p>
              </div>

              <div className="pt-4 border-t border-[#e7e2d9] flex items-center justify-between text-xs">
                <div>
                  {isFunded ? (
                    <div>
                      <span className="text-[#78716c] text-[11px] font-mono">Milestone Escrow: </span>
                      <span className="text-[#2d4a3e] font-mono font-bold text-sm">
                        ₹{p.budget_inr.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[#78716c] text-[11px] font-mono">Merit Credit: </span>
                      <span className="text-[#1e3a8a] font-mono font-bold text-sm">
                        {p.credit_pool_cu} CU (BADGES & CITATIONS)
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-[#2d4a3e] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View Charter & Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
