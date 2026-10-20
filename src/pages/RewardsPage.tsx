import React, { useState, useEffect } from 'react';
import { Project, User } from '../types';
import { api } from '../api';
import { DollarSign, Award, HelpCircle, CheckCircle2, ArrowRight, X, ExternalLink, Shield } from 'lucide-react';

interface RewardsPageProps {
  currentUser: User;
  onNavigateVerify: (code: string) => void;
}

export const RewardsPage: React.FC<RewardsPageProps> = ({ currentUser, onNavigateVerify }) => {
  const [activeModel, setActiveModel] = useState<'FUNDED' | 'KNOWLEDGE'>('FUNDED');
  const [fundedData, setFundedData] = useState<any | null>(null);
  const [creditData, setCreditData] = useState<any | null>(null);
  const [explanationModal, setExplanationModal] = useState<{ open: boolean; person: any | null }>({
    open: false,
    person: null,
  });

  const sampleVerificationCode = 'AF-2026-PRIYA01';

  useEffect(() => {
    const fetchCalculations = async () => {
      const [fRes, cRes] = await Promise.all([
        api.getRewardExplanation('proj_dr_01', 'FUNDED'),
        api.getRewardExplanation('proj_know_02', 'KNOWLEDGE'),
      ]);
      setFundedData(fRes.rewards);
      setCreditData(cRes.credits);
    };
    fetchCalculations();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="bg-white border border-[#e7e2d9] rounded p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs">
              <span className="text-[#2d4a3e] font-bold bg-[#eef3f0] px-2.5 py-0.5 rounded border border-[#2d4a3e]/30 uppercase tracking-wider">
                STAGE 07: SETTLEMENT ENGINE
              </span>
              <span className="text-[#a8a29e]">/</span>
              <span className="text-[#78716c]">MATHEMATICAL VERIFICATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] font-serif mb-1">
              Transparent Payout & Attribution Engine
            </h1>
            <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl leading-relaxed">
              Deterministic reward formulas with zero hidden variables. AI earns ₹0. All intellectual contributions are attributed to directing humans.
            </p>
          </div>

          {/* Model Toggle */}
          <div className="flex items-center bg-[#f5f3ef] p-1 rounded border border-[#e7e2d9] self-start md:self-auto font-mono text-xs">
            <button
              onClick={() => setActiveModel('FUNDED')}
              className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                activeModel === 'FUNDED'
                  ? 'bg-[#2d4a3e] text-white shadow-xs'
                  : 'text-[#57534e] hover:text-[#1c1917]'
              }`}
            >
              FUNDED MODEL (₹1,00,000)
            </button>
            <button
              onClick={() => setActiveModel('KNOWLEDGE')}
              className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                activeModel === 'KNOWLEDGE'
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'text-[#57534e] hover:text-[#1c1917]'
              }`}
            >
              KNOWLEDGE MODEL (100 CU)
            </button>
          </div>
        </div>
      </div>

      {/* VIEW A: FUNDED PROJECT (₹1,00,000 EXACT WORKED EXAMPLE) */}
      {activeModel === 'FUNDED' && fundedData && (
        <div className="space-y-6">
          {/* High-level budget waterfall card */}
          <div className="bg-white border border-[#e7e2d9] rounded p-6 shadow-xs">
            <h2 className="text-xs font-mono uppercase text-[#78716c] font-bold mb-4 tracking-wider">
              FUNDED SETTLEMENT WATERFALL (EXACT CANONICAL FORMULA)
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#fbfaf8] border border-[#e7e2d9] rounded">
                <div className="text-[#78716c] text-[10px]">TOTAL BUDGET</div>
                <div className="text-base font-bold text-[#1c1917] mt-1">₹1,00,000</div>
              </div>
              <div className="p-3 bg-[#fbfaf8] border border-[#e7e2d9] rounded">
                <div className="text-[#78716c] text-[10px]">PLATFORM FEE (10%)</div>
                <div className="text-base font-bold text-[#57534e] mt-1">₹10,000</div>
              </div>
              <div className="p-3 bg-[#fbfaf8] border border-[#e7e2d9] rounded">
                <div className="text-[#78716c] text-[10px]">AI RESERVE (5%)</div>
                <div className="text-base font-bold text-[#57534e] mt-1">₹5,000</div>
              </div>
              <div className="p-3 bg-[#eef3f0] border border-[#2d4a3e]/30 rounded">
                <div className="text-[#2d4a3e] text-[10px] font-bold">NET RESEARCH POOL</div>
                <div className="text-base font-bold text-[#2d4a3e] mt-1">₹85,000</div>
              </div>
              <div className="p-3 bg-[#fbfaf8] border border-[#e7e2d9] rounded">
                <div className="text-[#78716c] text-[10px]">LEAD EXPERT (30%)</div>
                <div className="text-base font-bold text-[#2d4a3e] mt-1">₹25,500</div>
              </div>
              <div className="p-3 bg-[#fbfaf8] border border-[#e7e2d9] rounded">
                <div className="text-[#78716c] text-[10px]">AI DIRECT EARNINGS</div>
                <div className="text-base font-bold text-[#78716c] mt-1">₹0 (RULE)</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#f5f3ef] border border-[#e7e2d9] rounded text-xs text-[#57534e] font-mono">
              Student Collaboration Pool: <strong className="text-[#1c1917]">₹59,500</strong> split into{' '}
              <span className="text-[#2d4a3e] font-semibold">Equal Base Component: ₹23,800 (40%)</span> and{' '}
              <span className="text-[#1e3a8a] font-semibold">Weighted Contribution Component: ₹35,700 (60%)</span>.
            </div>
          </div>

          {/* Participant Payout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Expert Card */}
            <div className="bg-white border border-[#e7e2d9] rounded p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-[#78716c] uppercase">LEAD EXPERT</span>
                  <span className="text-xs font-mono text-[#2d4a3e] font-bold">30% OF NET</span>
                </div>
                <h3 className="text-sm font-bold text-[#1c1917] mb-1">{fundedData.expert_payout.name}</h3>
                <div className="text-2xl font-extrabold text-[#2d4a3e] font-mono my-2">
                  ₹{fundedData.expert_payout.final_payout.toLocaleString()}
                </div>
                <p className="text-[11px] text-[#57534e] leading-relaxed mb-4">
                  {fundedData.expert_payout.explanation}
                </p>
              </div>

              <button
                onClick={() => setExplanationModal({ open: true, person: fundedData.expert_payout })}
                className="w-full py-2 bg-[#f5f3ef] hover:bg-[#ede9e3] text-[#1c1917] border border-[#d6cebf] rounded text-xs font-medium cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why was I paid?</span>
              </button>
            </div>

            {/* Students (Priya, Arun, Meera) */}
            {fundedData.students.map((stu: any) => (
              <div key={stu.name} className="bg-white border border-[#e7e2d9] rounded p-5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-[#78716c] uppercase">STUDENT CONTRIBUTOR</span>
                    <span className="text-xs font-mono text-[#2d4a3e] font-bold">WEIGHT: {stu.weight}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1c1917] mb-1">{stu.name}</h3>
                  <div className="text-2xl font-extrabold text-[#2d4a3e] font-mono my-2">
                    ₹{stu.final_payout.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#57534e] font-mono space-y-1 mb-4 bg-[#fbfaf8] p-2.5 rounded border border-[#e7e2d9]">
                    <div>Equal Part: ₹{stu.equal_part.toLocaleString()}</div>
                    <div>Weighted: ₹{stu.weighted_part.toLocaleString()}</div>
                  </div>
                </div>

                <button
                  onClick={() => setExplanationModal({ open: true, person: stu })}
                  className="w-full py-2 bg-[#f5f3ef] hover:bg-[#ede9e3] text-[#1c1917] border border-[#d6cebf] rounded text-xs font-medium cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why was I paid?</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW B: KNOWLEDGE PROJECT (100 CU TOTAL - STRICTLY ZERO ₹/Rs) */}
      {activeModel === 'KNOWLEDGE' && creditData && (
        <div className="space-y-6">
          {/* Credit Pool waterfall */}
          <div className="bg-white border border-[#e7e2d9] rounded p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e7e2d9]">
              <h2 className="text-xs font-mono uppercase text-[#1e3a8a] font-bold tracking-wider">
                NON-MONETARY ACADEMIC MERIT ALLOCATION (100 CONTRIBUTION UNITS)
              </h2>
              <span className="text-[11px] font-mono bg-[#eff6ff] text-[#1e3a8a] px-2 py-0.5 rounded border border-[#1e3a8a]/30 font-bold">
                ZERO FIAT (NO PAYMENT)
              </span>
            </div>

            <p className="text-xs text-[#57534e] mb-4 leading-relaxed">
              In accordance with academic protocol, this initiative operates strictly on academic credit.
              Contribution Units (CU) represent intellectual authorship weight, mentor recognition, and verifiable digital badges.
              <strong className="text-[#1c1917]"> Under protocol rules, CU is NOT fiat money and has zero INR valuation.</strong>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#fbfaf8] border border-[#e7e2d9] rounded">
                <div className="text-[#78716c] text-[10px]">TOTAL POOL</div>
                <div className="text-base font-bold text-[#1c1917] mt-1">100.0 CU</div>
              </div>
              <div className="p-3 bg-[#eff6ff] border border-[#1e3a8a]/30 rounded">
                <div className="text-[#1e3a8a] text-[10px] font-bold">LEAD EXPERT (20%)</div>
                <div className="text-base font-bold text-[#1e3a8a] mt-1">20.0 CU</div>
              </div>
              <div className="p-3 bg-[#eff6ff] border border-[#1e3a8a]/30 rounded">
                <div className="text-[#1e3a8a] text-[10px] font-bold">STUDENT POOL (80%)</div>
                <div className="text-base font-bold text-[#1e3a8a] mt-1">80.0 CU</div>
              </div>
              <div className="p-3 bg-[#fbfaf8] border border-[#e7e2d9] rounded">
                <div className="text-[#78716c] text-[10px]">STUDENT BASE COMPONENT</div>
                <div className="text-base font-bold text-[#57534e] mt-1">8.0 CU EACH</div>
              </div>
            </div>
          </div>

          {/* Credit cards & Co-Authorship Rank */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Expert Credit */}
            <div className="bg-white border border-[#e7e2d9] rounded p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-[#78716c] uppercase">SUPERVISING AUTHOR</span>
                  <span className="text-xs font-mono text-[#1e3a8a] font-bold">20% SHARE</span>
                </div>
                <h3 className="text-sm font-bold text-[#1c1917] mb-1">{creditData.expert_credit.name}</h3>
                <div className="text-2xl font-extrabold text-[#1e3a8a] font-mono my-2">
                  {creditData.expert_credit.final_cu} CU
                </div>
                <p className="text-[11px] text-[#57534e] leading-relaxed mb-4">
                  {creditData.expert_credit.explanation}
                </p>
              </div>

              <button
                onClick={() => setExplanationModal({ open: true, person: creditData.expert_credit })}
                className="w-full py-2 bg-[#f5f3ef] hover:bg-[#ede9e3] text-[#1c1917] border border-[#d6cebf] rounded text-xs font-medium cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why was I credited?</span>
              </button>
            </div>

            {/* Students Credit Cards (Priya 36.0, Arun 24.8, Meera 19.2) */}
            {creditData.students.map((stu: any, idx: number) => (
              <div key={stu.name} className="bg-white border border-[#e7e2d9] rounded p-5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-[#78716c] uppercase">
                      AUTHOR ORDER: #{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-[#1e3a8a] font-bold">WEIGHT: {stu.weight}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1c1917] mb-1">{stu.name}</h3>
                  <div className="text-2xl font-extrabold text-[#1e3a8a] font-mono my-2">
                    {stu.final_cu} CU
                  </div>
                  <div className="text-[11px] text-[#57534e] font-mono space-y-1 mb-4 bg-[#fbfaf8] p-2.5 rounded border border-[#e7e2d9]">
                    <div>Equal Base: {stu.equal_cu} CU</div>
                    <div>Weighted Component: {stu.weighted_cu} CU</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setExplanationModal({ open: true, person: stu })}
                    className="w-full py-2 bg-[#f5f3ef] hover:bg-[#ede9e3] text-[#1c1917] border border-[#d6cebf] rounded text-xs font-medium cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why was I credited?</span>
                  </button>

                  {idx === 0 && (
                    <button
                      onClick={() => onNavigateVerify('AF-2026-PRIYA01')}
                      className="w-full py-1.5 bg-[#eff6ff] hover:bg-[#dbeafe] text-[#1e3a8a] border border-[#1e3a8a]/30 rounded text-[11px] font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Inspect Verifiable Credential</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* "Why Was I Paid?" / "Why Was I Credited?" Modal */}
      {explanationModal.open && explanationModal.person && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#e7e2d9] max-w-lg w-full rounded p-6 text-[#1c1917] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7e2d9]">
              <h3 className="text-sm font-bold text-[#1c1917] font-mono flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#2d4a3e]" />
                <span>
                  {activeModel === 'FUNDED' ? 'Why was I paid?' : 'Why was I credited?'}
                </span>
              </h3>
              <button
                onClick={() => setExplanationModal({ open: false, person: null })}
                className="text-[#78716c] hover:text-[#1c1917] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#78716c] font-mono">Contributor: </span>
                <span className="text-[#1c1917] font-bold">{explanationModal.person.name}</span> ({explanationModal.person.role})
              </div>

              <div>
                <span className="text-[#78716c] font-mono">Milestone Delivered: </span>
                <span className="text-[#1c1917] font-mono">Milestone 1: Dataset & Architecture Preparation</span>
              </div>

              <div>
                <span className="text-[#78716c] font-mono">Peer Review Outcome: </span>
                <span className="text-[#2d4a3e] font-bold">ACCEPT (Clinical validation score: 88/100)</span>
              </div>

              {activeModel === 'FUNDED' ? (
                <div className="p-3 bg-[#fbfaf8] rounded border border-[#e7e2d9] font-mono space-y-1.5 text-[#44403c]">
                  <div className="text-[#2d4a3e] font-bold text-sm">
                    Final Disbursed Payout: ₹{explanationModal.person.final_payout.toLocaleString()}
                  </div>
                  <div>Equal Share Component: ₹{explanationModal.person.equal_part?.toLocaleString() || 'N/A'}</div>
                  <div>Weighted Component: ₹{explanationModal.person.weighted_part?.toLocaleString() || 'N/A'}</div>
                  <div>Attribution Weight: {explanationModal.person.weight || 0.3}</div>
                  <div className="text-[11px] text-[#78716c] pt-1 border-t border-[#e7e2d9]">
                    Mathematical Proof: Equal base ₹7,933 + (Weight {explanationModal.person.weight} × Weighted pool ₹35,700) = ₹{explanationModal.person.final_payout.toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#fbfaf8] rounded border border-[#e7e2d9] font-mono space-y-1.5 text-[#44403c]">
                  <div className="text-[#1e3a8a] font-bold text-sm">
                    Final Academic Award: {explanationModal.person.final_cu} CU
                  </div>
                  <div>Equal Base Share: {explanationModal.person.equal_cu} CU</div>
                  <div>Weighted Authorship Share: {explanationModal.person.weighted_cu} CU</div>
                  <div className="text-[11px] text-[#78716c] pt-1 border-t border-[#e7e2d9]">
                    Formal Attribution: Co-authored research whitepaper, credential badge verification code, and permanent ledger citation record.
                  </div>
                </div>
              )}

              <p className="text-[11px] text-[#57534e] leading-relaxed italic">
                {explanationModal.person.explanation}
              </p>
            </div>

            <button
              onClick={() => setExplanationModal({ open: false, person: null })}
              className="w-full py-2 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-semibold cursor-pointer"
            >
              Close Mathematical Proof
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
