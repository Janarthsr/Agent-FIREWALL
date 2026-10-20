import React, { useState, useEffect } from 'react';
import { Dispute, User } from '../types';
import { api } from '../api';
import { Scale, CheckCircle2, AlertCircle, PlusCircle, Check, Clock } from 'lucide-react';

interface DisputesPageProps {
  currentUser: User;
  onRefreshLedger: () => void;
}

export const DisputesPage: React.FC<DisputesPageProps> = ({ currentUser, onRefreshLedger }) => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  // New Dispute Form
  const [targetType, setTargetType] = useState<'CONTRIBUTION' | 'PAYOUT' | 'CREDENTIAL'>('CONTRIBUTION');
  const [targetId, setTargetId] = useState('sub_base_01');
  const [reason, setReason] = useState('Disputed attribution weighting between secondary and primary researchers.');
  const [submitting, setSubmitting] = useState(false);

  // Resolution Form
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('Mediation completed. Weight adjusted by 0.05 on subsequent milestone.');
  const [resolving, setResolving] = useState(false);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const list = await api.getDisputes();
      setDisputes(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createDispute({
        project_id: 'proj_dr_01',
        complainant_id: currentUser.id,
        target_type: targetType,
        target_id: targetId,
        reason,
      });
      alert('Formal dispute opened and registered on ledger.');
      await fetchDisputes();
      onRefreshLedger();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveDispute = async (disputeId: string) => {
    setResolving(true);
    try {
      await api.resolveDispute(disputeId, resolutionText, currentUser.id);
      alert('Dispute resolved. Resolution logged as a new cryptographic ledger entry.');
      setResolvingId(null);
      await fetchDisputes();
      onRefreshLedger();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResolving(false);
    }
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="bg-white border border-[#e7e2d9] rounded p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2 font-mono text-xs">
          <span className="text-[#854d0e] font-bold bg-[#fef9ee] px-2.5 py-0.5 rounded border border-[#854d0e]/30 uppercase tracking-wider">
            DISPUTE RESOLUTION PROTOCOL
          </span>
          <span className="text-[#a8a29e]">/</span>
          <span className="text-[#78716c]">APPEND-ONLY CORRECTIONS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] font-serif mb-1">
          Formal Dispute & Attribution Mediation
        </h1>
        <p className="text-xs sm:text-sm text-[#57534e] max-w-3xl leading-relaxed">
          Dispute resolutions never mutate historical data. All corrections and mediations are recorded as <strong>new immutable ledger entries</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column (5 cols): File Dispute Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#e7e2d9] rounded p-6 shadow-xs">
            <h2 className="text-sm font-bold text-[#1c1917] uppercase tracking-wider font-mono mb-2 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#854d0e]" />
              <span>Raise Attribution Dispute</span>
            </h2>
            <p className="text-xs text-[#57534e] mb-4">
              Authenticated Complainant: <strong className="text-[#1c1917]">{currentUser.name}</strong> ({currentUser.role})
            </p>

            <form onSubmit={handleCreateDispute} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#78716c] uppercase mb-1">Dispute Target Type</label>
                <select
                  value={targetType}
                  onChange={(e: any) => setTargetType(e.target.value)}
                  className="w-full bg-[#fbfaf8] border border-[#d6cebf] rounded p-2 text-[#1c1917] font-bold"
                >
                  <option value="CONTRIBUTION">CONTRIBUTION (Authorship / Work Claim)</option>
                  <option value="PAYOUT">PAYOUT (Monetary Distribution Formula)</option>
                  <option value="CREDENTIAL">CREDENTIAL (Badge / Certification Verification)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#78716c] uppercase mb-1">Target Identifier (Artifact/Milestone ID)</label>
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-[#fbfaf8] border border-[#d6cebf] rounded p-2 text-[#1c1917]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#78716c] uppercase mb-1">Reason for Dispute</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#fbfaf8] border border-[#d6cebf] rounded p-2 text-[#1c1917] font-sans text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-[#854d0e] hover:bg-[#713f12] text-white font-bold rounded cursor-pointer transition-colors shadow-xs"
              >
                {submitting ? 'Registering on Ledger...' : 'Log Dispute to Cryptographic Ledger'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (7 cols): Disputes Ledger */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-[#e7e2d9] rounded p-6 shadow-xs">
            <h2 className="text-sm font-bold text-[#1c1917] uppercase tracking-wider font-mono mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#2d4a3e]" />
                <span>Active Disputes Ledger ({disputes.length})</span>
              </div>
              <span className="text-xs text-[#78716c] font-normal font-mono">
                {disputes.filter((d) => d.status === 'OPEN').length} OPEN
              </span>
            </h2>

            {disputes.length === 0 ? (
              <div className="p-8 text-center bg-[#fbfaf8] rounded border border-[#e7e2d9] text-xs text-[#78716c] font-mono">
                No formal disputes registered on ledger.
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((dsp) => {
                  const isOpen = dsp.status === 'OPEN';
                  return (
                    <div
                      key={dsp.id}
                      className={`p-4 rounded border text-xs ${
                        isOpen
                          ? 'bg-[#fef9ee] border-[#854d0e]/30 text-[#854d0e]'
                          : 'bg-[#fbfaf8] border-[#e7e2d9] text-[#57534e]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-[#1c1917]">{dsp.target_type} DISPUTE</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isOpen ? 'bg-[#854d0e] text-white' : 'bg-[#eef3f0] text-[#2d4a3e] border border-[#2d4a3e]/30'
                          }`}
                        >
                          {dsp.status}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-[#78716c] mb-2">
                        ID: {dsp.id} · Complainant: {dsp.complainant_name || dsp.complainant_id} · Target: {dsp.target_id}
                      </div>

                      <p className="text-xs text-[#1c1917] leading-relaxed mb-3">
                        "{dsp.reason}"
                      </p>

                      {dsp.resolution && (
                        <div className="p-3 bg-white border border-[#e7e2d9] rounded text-[11px] font-mono space-y-1">
                          <div className="font-bold text-[#2d4a3e]">Mediation Resolution:</div>
                          <div className="text-[#44403c]">{dsp.resolution}</div>
                        </div>
                      )}

                      {/* Admin Resolution Trigger */}
                      {isOpen && isAdmin && (
                        <div className="mt-3 pt-3 border-t border-[#e7e2d9] space-y-2">
                          <input
                            type="text"
                            value={resolutionText}
                            onChange={(e) => setResolutionText(e.target.value)}
                            className="w-full bg-white border border-[#d6cebf] rounded p-2 text-xs text-[#1c1917] font-mono"
                            placeholder="Enter mediation terms..."
                          />
                          <button
                            onClick={() => handleResolveDispute(dsp.id)}
                            disabled={resolving}
                            className="px-3 py-1.5 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{resolving ? 'Anchoring...' : 'Resolve & Append to Ledger'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
