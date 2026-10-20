import React, { useState, useEffect } from 'react';
import { Project, Submission, User } from '../types';
import { api } from '../api';
import { CheckCircle2, XCircle, AlertTriangle, FileText, Check, X, ArrowRight, ShieldCheck, Star, Clock } from 'lucide-react';

interface ReviewPageProps {
  projectId: string;
  currentUser: User;
  onNavigateRewards: () => void;
  onRefreshLedger: () => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({
  projectId,
  currentUser,
  onNavigateRewards,
  onRefreshLedger,
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Form Modal / State
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [decision, setDecision] = useState<'ACCEPT' | 'REJECT'>('ACCEPT');
  const [feedback, setFeedback] = useState('Rigorous methodology with verified synthetic fundus validation.');
  const [score, setScore] = useState(88);
  const [reviewing, setReviewing] = useState(false);
  const [settling, setSettling] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [proj, subs] = await Promise.all([
        api.getProject(projectId),
        api.getSubmissions(projectId),
      ]);
      setProject(proj);
      setSubmissions(subs);
      if (subs.length > 0 && !selectedSub) {
        setSelectedSub(subs[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setReviewing(true);
    try {
      await api.reviewSubmission({
        submission_id: selectedSub.id,
        reviewer_id: currentUser.id,
        decision,
        feedback,
        score,
      });
      alert(`Submission marked as ${decision}. Logged WORK_${decision}ED to ledger.`);
      await loadData();
      onRefreshLedger();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReviewing(false);
    }
  };

  const handleSettleMilestone = async () => {
    if (!project?.milestones || project.milestones.length === 0) return;
    setSettling(true);
    try {
      const mid = project.milestones[0].id;
      await api.settleMilestone(mid, projectId, currentUser.id);
      alert('Milestone accepted and escrow released! Payout distributions calculated and logged.');
      await loadData();
      onRefreshLedger();
      onNavigateRewards();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSettling(false);
    }
  };

  const canSettle = currentUser.role === 'sponsor' || currentUser.role === 'admin';
  const canReview = currentUser.role === 'expert' || currentUser.role === 'sponsor' || currentUser.role === 'admin';

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="bg-white border border-[#e7e2d9] rounded p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-[#2d4a3e] font-bold bg-[#eef3f0] px-2.5 py-0.5 rounded border border-[#2d4a3e]/30 uppercase tracking-wider">
                STAGE 05: REVIEW & VERIFY
              </span>
              <span className="text-[#a8a29e] text-xs font-mono">/</span>
              <span className="text-[#78716c] text-xs font-mono">PEER AUDIT & SETTLEMENT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] font-serif mb-1">
              Submission Evaluation & Peer Review
            </h1>
            <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl leading-relaxed">
              Verify research deliverable integrity, inspect 5-gram Jaccard similarity signals, score acceptance criteria, and trigger milestone settlement.
            </p>
          </div>

          {canSettle && (
            <button
              onClick={handleSettleMilestone}
              disabled={settling}
              className="px-5 py-2.5 bg-[#2d4a3e] hover:bg-[#233a31] text-white font-bold rounded text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-[#e7e2d9]" />
              <span>{settling ? 'Settling Escrow...' : 'Release Escrow & Settle Payouts'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Submissions List & Similarity Flags (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#e7e2d9] rounded p-5 shadow-xs">
            <h2 className="text-sm font-bold text-[#1c1917] uppercase tracking-wider font-mono mb-3 flex items-center justify-between">
              <span>Submitted Artifacts</span>
              <span className="text-xs text-[#78716c] font-normal">{submissions.length} Files</span>
            </h2>

            <div className="space-y-3">
              {submissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSub(sub)}
                    className={`p-3.5 rounded border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#f5f3ef] border-[#2d4a3e] shadow-xs'
                        : 'bg-[#fbfaf8] border-[#e7e2d9] hover:border-[#d6cebf]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#1c1917] font-mono">{sub.file_name}</span>
                      {sub.similarity_flag ? (
                        <span className="text-[10px] font-mono font-bold bg-[#fbf0f1] text-[#7a222b] px-2 py-0.5 rounded border border-[#7a222b]/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-[#7a222b]" />
                          <span>SIMILARITY FLAGGED ({Math.round(sub.similarity_score * 100)}%)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#2d4a3e] font-semibold bg-[#eef3f0] px-2 py-0.5 rounded">
                          CLEAN
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-[#57534e] line-clamp-2 mb-2 font-mono">
                      {sub.file_content}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#78716c] font-mono">
                      <span>Author: {sub.author_name || sub.author_id}</span>
                      <span>AI Tool Use: {sub.ai_use_pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Review Details & Acceptance Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedSub ? (
            <div className="bg-white border border-[#e7e2d9] rounded p-6 space-y-6 shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-[#1c1917] font-mono">{selectedSub.file_name}</h3>
                  <span className="text-xs font-mono text-[#78716c]">ID: {selectedSub.id}</span>
                </div>
                <div className="text-xs font-mono text-[#78716c] mb-4 truncate">
                  SHA-256 Digest: {selectedSub.sha256_hash}
                </div>

                {/* Similarity Alert Banner if Flagged */}
                {selectedSub.similarity_flag && (
                  <div className="p-4 bg-[#fef9ee] border border-[#854d0e]/40 rounded mb-4 text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#854d0e] font-mono mb-1">
                      <AlertTriangle className="w-4 h-4 text-[#854d0e]" />
                      <span>5-GRAM JACCARD SIMILARITY FLAGGED (SCORE: {Math.round(selectedSub.similarity_score * 100)}%)</span>
                    </div>
                    <p className="text-[#57534e] leading-relaxed">
                      Similarity threshold (35%) exceeded against historical baseline repository.
                      <strong> Note: Similarity flag is a human-review signal only and does not automatically reject work.</strong>
                    </p>
                  </div>
                )}

                <div className="p-4 bg-[#fbfaf8] border border-[#e7e2d9] rounded font-mono text-xs text-[#1c1917] leading-relaxed max-h-48 overflow-y-auto mb-6 scrollbar-thin">
                  {selectedSub.file_content}
                </div>
              </div>

              {/* Review Decision Form for Expert / Sponsor / Admin */}
              {canReview ? (
                <form onSubmit={handleSubmitReview} className="space-y-4 pt-4 border-t border-[#e7e2d9]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1c1917] uppercase font-mono">Review Decision</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-[#2d4a3e] font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="decision"
                          checked={decision === 'ACCEPT'}
                          onChange={() => setDecision('ACCEPT')}
                          className="text-[#2d4a3e]"
                        />
                        <span>ACCEPT WORK</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-[#7a222b] font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="decision"
                          checked={decision === 'REJECT'}
                          onChange={() => setDecision('REJECT')}
                          className="text-[#7a222b]"
                        />
                        <span>REJECT</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#78716c] mb-1">
                      <span>Clinical / Technical Score</span>
                      <span className="text-[#1c1917] font-bold">{score} / 100</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      className="w-full accent-[#2d4a3e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#78716c] mb-1">
                      Expert Review Comments & Feedback
                    </label>
                    <textarea
                      rows={3}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full bg-[#fbfaf8] border border-[#d6cebf] rounded p-2.5 text-xs text-[#1c1917]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewing}
                    className="w-full py-2.5 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    {reviewing ? 'Recording on Ledger...' : `Confirm Review & Log to Cryptographic Ledger`}
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-[#f5f3ef] border border-[#e7e2d9] rounded text-xs text-[#57534e] space-y-1">
                  <div className="font-bold text-[#1c1917] font-mono">Contributor View:</div>
                  <div>Only assigned clinical experts, mentors, or sponsors may submit official evaluations for this deliverable.</div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-[#e7e2d9] rounded text-xs text-[#78716c] font-mono shadow-xs">
              Select an artifact from the list to inspect evaluation details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
