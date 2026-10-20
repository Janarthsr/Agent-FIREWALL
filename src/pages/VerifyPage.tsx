import React, { useState, useEffect } from 'react';
import { Credential } from '../types';
import { api } from '../api';
import { Award, ShieldCheck, CheckCircle2, AlertOctagon, Search, ExternalLink, Calendar, UserCheck, Hash } from 'lucide-react';

interface VerifyPageProps {
  initialCode?: string;
}

export const VerifyPage: React.FC<VerifyPageProps> = ({ initialCode = 'AF-2026-PRIYA01' }) => {
  const [code, setCode] = useState(initialCode);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (queryCode: string) => {
    if (!queryCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyCredential(queryCode.trim().toUpperCase());
      if (!res || !res.verification_code) {
        setError('No credential found with this verification code.');
        setCredential(null);
      } else {
        setCredential(res);
      }
    } catch (err: any) {
      setError(err.message || 'Verification lookup failed');
      setCredential(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
  }, [initialCode]);

  const isValid = credential?.status === 'VALID';
  const isTampered = credential?.status === 'TAMPERED';
  const isRevoked = credential?.status === 'REVOKED';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white border border-[#e7e2d9] rounded p-6 sm:p-8 text-center shadow-xs">
        <div className="inline-flex items-center gap-2 mb-3 bg-[#eef3f0] px-3 py-1 rounded-full border border-[#2d4a3e]/30 text-xs font-mono text-[#2d4a3e]">
          <ShieldCheck className="w-4 h-4 text-[#2d4a3e]" />
          <span>PUBLIC VERIFIABLE CREDENTIAL REGISTRY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] font-serif mb-2">
          Academic Credential & Authorship Verification
        </h1>
        <p className="text-xs sm:text-sm text-[#57534e] max-w-xl mx-auto leading-relaxed">
          Verify digital credentials, authorship rankings, and Contribution Units (CU) cryptographically anchored to the Agent Firewall ledger.
        </p>

        {/* Verification Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(code);
          }}
          className="mt-6 max-w-md mx-auto flex items-center gap-2"
        >
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. AF-2026-PRIYA01"
            className="flex-1 bg-[#fbfaf8] border border-[#d6cebf] rounded px-3 py-2 text-sm text-[#1c1917] font-mono focus:outline-none focus:border-[#2d4a3e] uppercase"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-[#fbf0f1] border border-[#7a222b]/30 rounded text-xs text-[#7a222b] max-w-md mx-auto">
            {error}
          </div>
        )}
      </div>

      {/* Verification Result */}
      {credential && (
        <div className="bg-white border border-[#e7e2d9] rounded p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Status Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e2d9]">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded flex items-center justify-center shrink-0 ${
                  isValid
                    ? 'bg-[#eef3f0] text-[#2d4a3e] border border-[#2d4a3e]/30'
                    : isTampered
                    ? 'bg-[#fbf0f1] text-[#7a222b] border border-[#7a222b]/30'
                    : 'bg-[#f5f3ef] text-[#78716c] border border-[#e7e2d9]'
                }`}
              >
                {isValid ? <CheckCircle2 className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
              </div>
              <div>
                <div className="text-lg font-bold text-[#1c1917] font-serif">
                  {isValid
                    ? 'AUTHENTIC & CRYPTOGRAPHICALLY VALID'
                    : isTampered
                    ? 'TAMPER DETECTED / INVALID HASH'
                    : 'CREDENTIAL REVOKED'}
                </div>
                <div className="text-xs text-[#78716c] font-mono">
                  Verification Code: <strong className="text-[#1c1917]">{credential.verification_code}</strong>
                </div>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded text-xs font-mono font-bold self-start sm:self-auto ${
                isValid ? 'bg-[#eef3f0] text-[#2d4a3e]' : 'bg-[#fbf0f1] text-[#7a222b]'
              }`}
            >
              {credential.status}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-[#fbfaf8] border border-[#e7e2d9] rounded space-y-3 font-mono">
              <div>
                <div className="text-[10px] text-[#78716c] uppercase">CREDENTIAL RECIPIENT</div>
                <div className="text-base font-bold text-[#1c1917] mt-0.5">{credential.recipient_name}</div>
                <div className="text-[11px] text-[#78716c]">ID: {credential.recipient_id}</div>
              </div>

              <div>
                <div className="text-[10px] text-[#78716c] uppercase">CREDENTIAL TYPE & RANK</div>
                <div className="font-bold text-[#2d4a3e] mt-0.5">
                  {credential.type} · Author Order #{credential.author_rank}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#78716c] uppercase">MERIT AWARD VALUE</div>
                <div className="text-base font-extrabold text-[#1e3a8a] mt-0.5">
                  {credential.credit_cu} CU (CONTRIBUTION UNITS)
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#fbfaf8] border border-[#e7e2d9] rounded space-y-3 font-mono">
              <div>
                <div className="text-[10px] text-[#78716c] uppercase">ASSOCIATED INITIATIVE</div>
                <div className="text-xs font-bold text-[#1c1917] mt-0.5">{credential.project_title}</div>
                <div className="text-[11px] text-[#78716c]">Project ID: {credential.project_id}</div>
              </div>

              <div>
                <div className="text-[10px] text-[#78716c] uppercase">CRYPTOGRAPHIC ANCHOR ID</div>
                <div className="text-[11px] text-[#57534e] mt-0.5 truncate">
                  Ledger Entry: {credential.ledger_entry_id}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#78716c] uppercase">TIMESTAMP & ISSUER</div>
                <div className="text-[11px] text-[#57534e] mt-0.5">
                  Issued: {credential.issued_at} by {credential.human_issuer_id}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
