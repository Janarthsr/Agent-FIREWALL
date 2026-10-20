import React, { useState, useEffect } from 'react';
import { LedgerEntry, LedgerVerification, User } from '../types';
import { api } from '../api';
import { Database, CheckCircle2, AlertOctagon, RefreshCw, ShieldAlert, Wrench, Search, Filter } from 'lucide-react';

interface LedgerPageProps {
  currentUser?: User;
  onRefreshLedger: () => void;
}

export const LedgerPage: React.FC<LedgerPageProps> = ({ currentUser, onRefreshLedger }) => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [verification, setVerification] = useState<LedgerVerification | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterAction, setFilterAction] = useState('');
  const [filterActor, setFilterActor] = useState('');
  const [tampering, setTampering] = useState(false);
  const [repairing, setRepairing] = useState(false);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const [list, ver] = await Promise.all([
        api.getLedger({ action: filterAction || undefined, actorId: filterActor || undefined }),
        api.verifyLedger(),
      ]);
      setEntries(list);
      setVerification(ver);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [filterAction, filterActor]);

  const handleTamperOldEntry = async () => {
    if (entries.length === 0) return;
    const targetEntry = entries[entries.length > 2 ? entries.length - 2 : 0];
    setTampering(true);
    try {
      await api.tamperLedger(targetEntry.entry_id);
      await fetchLedger();
      onRefreshLedger();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTampering(false);
    }
  };

  const handleRepairLedger = async () => {
    setRepairing(true);
    try {
      await api.repairDemo();
      await fetchLedger();
      onRefreshLedger();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRepairing(false);
    }
  };

  const isValid = verification?.valid ?? true;

  return (
    <div className="space-y-8">
      {/* Prominent Integrity Banner */}
      <div
        className={`p-6 sm:p-8 rounded border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all shadow-xs ${
          isValid
            ? 'bg-[#eef3f0] border-[#2d4a3e]/30 text-[#1c1917]'
            : 'bg-[#fbf0f1] border-[#7a222b]/40 text-[#7a222b] shadow-md'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded flex items-center justify-center shrink-0 ${
              isValid ? 'bg-[#2d4a3e] text-white' : 'bg-[#7a222b] text-white animate-pulse'
            }`}
          >
            {isValid ? <CheckCircle2 className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight font-serif text-[#1c1917]">
                {isValid ? 'Ledger Cryptographic Integrity Verified' : 'Ledger Tamper Detected'}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  isValid ? 'bg-[#2d4a3e] text-white' : 'bg-[#7a222b] text-white'
                }`}
              >
                {verification?.status || 'STATUS CHECK'}
              </span>
            </div>

            <p className="text-xs text-[#57534e] max-w-2xl leading-relaxed">
              {verification?.message || 'Cryptographic SHA-256 hash chain walking and linkage verification.'}
            </p>

            <div className="mt-2 text-[11px] font-mono text-[#78716c]">
              Head Hash: <span className="text-[#1c1917] font-semibold">{verification?.head_hash || entries[0]?.current_hash || '0'.repeat(64)}</span>
            </div>
          </div>
        </div>

        {/* Demo Tamper & Repair Controls */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          {isValid ? (
            <button
              onClick={handleTamperOldEntry}
              disabled={tampering}
              className="px-4 py-2 bg-[#fef9ee] hover:bg-[#fcf1db] text-[#854d0e] rounded text-xs font-bold border border-[#854d0e]/30 flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              title="Tamper an old ledger entry to simulate database tampering and prove HASH_MISMATCH"
            >
              <ShieldAlert className="w-4 h-4 text-[#854d0e]" />
              <span>{tampering ? 'Tampering...' : 'Tamper Ledger Row'}</span>
            </button>
          ) : (
            <button
              onClick={handleRepairLedger}
              disabled={repairing}
              className="px-4 py-2 bg-[#2d4a3e] hover:bg-[#233a31] text-white rounded text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              title="Repair and re-synchronize cryptographic ledger state"
            >
              <Wrench className="w-4 h-4 text-white" />
              <span>{repairing ? 'Restoring...' : 'Restore & Repair Chain'}</span>
            </button>
          )}

          <button
            onClick={fetchLedger}
            className="p-2 bg-white hover:bg-[#f5f3ef] text-[#57534e] rounded border border-[#d6cebf] cursor-pointer transition-colors"
            title="Re-verify entire ledger chain from genesis"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#e7e2d9] rounded p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#78716c]" />
            <span className="text-[#78716c] font-mono text-[11px] uppercase">Filter Action:</span>
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-[#fbfaf8] border border-[#d6cebf] rounded px-2.5 py-1 text-[#1c1917] text-xs focus:outline-none"
          >
            <option value="">All Protocol Actions ({entries.length})</option>
            <option value="PROJECT_POSTED">PROJECT_POSTED</option>
            <option value="CHARTER_PUBLISHED">CHARTER_PUBLISHED</option>
            <option value="CHARTER_ACCEPTED">CHARTER_ACCEPTED</option>
            <option value="BRIEF_ACCESS_ALLOWED">BRIEF_ACCESS_ALLOWED</option>
            <option value="BRIEF_ACCESS_DENIED">BRIEF_ACCESS_DENIED</option>
            <option value="AGENT_TOOL_REQUEST">AGENT_TOOL_REQUEST</option>
            <option value="COI_FILTERED">COI_FILTERED</option>
            <option value="ESCROW_FUNDED">ESCROW_FUNDED</option>
            <option value="PAYOUT_RELEASED">PAYOUT_RELEASED</option>
            <option value="CREDENTIAL_ISSUED">CREDENTIAL_ISSUED</option>
          </select>
        </div>

        <div className="text-xs text-[#78716c] font-mono">
          Showing {entries.length} Append-Only Ledger Entries
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-[#e7e2d9] rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#f5f3ef] border-b border-[#e7e2d9] text-[#78716c] text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Entry ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Actor / Owner</th>
                <th className="py-3 px-4">Reason / Verification</th>
                <th className="py-3 px-4">Current Hash</th>
                <th className="py-3 px-4">Prev Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e2d9]">
              {entries.map((entry) => {
                const isBrokenRow = verification?.broken_entry_id === entry.entry_id;
                const isBlock = entry.decision === 'BLOCK';
                const isAllow = entry.decision === 'ALLOW';

                return (
                  <tr
                    key={entry.entry_id}
                    className={`transition-colors ${
                      isBrokenRow
                        ? 'bg-[#fbf0f1] text-[#7a222b] border-l-4 border-l-[#7a222b] font-bold'
                        : 'hover:bg-[#fbfaf8] text-[#44403c]'
                    }`}
                  >
                    <td className="py-3 px-4 text-[#2d4a3e] font-semibold">{entry.entry_id}</td>
                    <td className="py-3 px-4 text-[#78716c] whitespace-nowrap">{entry.ts}</td>
                    <td className="py-3 px-4">
                      <span className="bg-[#f5f3ef] px-2 py-0.5 rounded border border-[#e7e2d9] text-[10px] text-[#1c1917]">
                        {entry.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isBlock
                            ? 'bg-[#fbf0f1] text-[#7a222b] border border-[#7a222b]/30'
                            : isAllow
                            ? 'bg-[#eef3f0] text-[#2d4a3e] border border-[#2d4a3e]/30'
                            : 'bg-[#fef9ee] text-[#854d0e] border border-[#854d0e]/30'
                        }`}
                      >
                        {entry.decision}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#78716c] truncate max-w-[120px]">
                      {entry.actor_id} / {entry.human_owner_id}
                    </td>
                    <td className="py-3 px-4 text-[#1c1917] max-w-xs truncate" title={entry.reason}>
                      {isBrokenRow ? (
                        <span className="text-[#7a222b] font-bold">
                          [TAMPER DETECTED: HASH MISMATCH] {entry.reason}
                        </span>
                      ) : (
                        entry.reason
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#78716c] truncate max-w-[100px]" title={entry.current_hash}>
                      {entry.current_hash.slice(0, 10)}...
                    </td>
                    <td className="py-3 px-4 text-[#a8a29e] truncate max-w-[100px]" title={entry.prev_hash}>
                      {entry.prev_hash === '0'.repeat(64) ? 'GENESIS' : `${entry.prev_hash.slice(0, 10)}...`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
