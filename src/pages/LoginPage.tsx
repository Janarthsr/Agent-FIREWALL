import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../api';
import { Shield, Lock, AlertCircle, ChevronDown, ChevronUp, ArrowLeft, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDemoGuide, setShowDemoGuide] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email.trim(), password);
      if (res.error) {
        setError(res.error);
      } else if (res.user && res.token) {
        localStorage.setItem('agent_firewall_token', res.token);
        onLoginSuccess(res.user, res.token);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoAccount = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#1c1917] flex flex-col justify-between py-10 px-6 sm:px-12 selection:bg-[#244034] selection:text-[#faf7f2] font-sans">
      {/* Top Header Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#e8e3da]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-[#244034] text-[#faf7f2] flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#ede7de]" strokeWidth={1.8} />
          </div>
          <div>
            <span className="font-serif font-bold text-sm tracking-wider uppercase text-[#1c1917]">
              Agent Firewall
            </span>
            <span className="text-[10px] text-[#78716c] font-mono tracking-widest block uppercase">
              Gardenia 2K26 Finals
            </span>
          </div>
        </div>

        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="text-xs font-mono text-[#57534e] hover:text-[#1c1917] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
        )}
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-4xl mx-auto w-full my-auto py-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Editorial Philosophy (7 cols) */}
        <div className="md:col-span-7 p-8 sm:p-10 bg-[#f5f0e6]/60 border border-[#e8e3da] rounded-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#244034] font-semibold bg-[#edf3ef] px-2.5 py-1 rounded-sm border border-[#244034]/20">
                Institutional Access
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#1c1917] leading-tight font-normal">
              Agent Firewall
            </h1>

            <div className="font-serif italic text-lg sm:text-xl text-[#244034]">
              “Trust, enforced.”
            </div>

            <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed font-sans">
              Deterministic trust infrastructure for multi-user human + AI collaboration. Roles, milestones, and security boundaries are governed by code, verified by human owners, and sealed to the cryptographic ledger.
            </p>

            {/* The Four Principles Reference */}
            <div className="pt-6 border-t border-[#e2dcd0] space-y-3 font-mono text-xs">
              <div className="flex items-start gap-3">
                <span className="text-[#1c1917] font-semibold w-24 shrink-0">01. CHARTER</span>
                <span className="text-[#57534e]">Pre-execution trust & reward allocation.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#244034] font-semibold w-24 shrink-0">02. FIREWALL</span>
                <span className="text-[#57534e]">Deterministic 4-stage policy evaluation.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#854d0e] font-semibold w-24 shrink-0">03. HUMAN</span>
                <span className="text-[#57534e]">Owns decision. Hard blocks cannot be bypassed.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#1c1917] font-semibold w-24 shrink-0">04. LEDGER</span>
                <span className="text-[#57534e]">Proves history on append-only SHA-256 chain.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#e2dcd0] text-[11px] font-mono text-[#78716c]">
            THE LLM MAY PROPOSE. CODE DECIDES. DOCUMENTS ARE DATA, NEVER INSTRUCTIONS.
          </div>
        </div>

        {/* Right Authentication Form (5 cols) */}
        <div className="md:col-span-5 p-8 sm:p-10 bg-white border border-[#e8e3da] rounded-sm flex flex-col justify-between shadow-xs">
          <div>
            <div className="mb-6">
              <h2 className="font-serif text-xl text-[#1c1917] font-normal">Sign In</h2>
              <p className="text-xs text-[#78716c] mt-1 font-sans">Authenticate with your institutional account.</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-[#fbf0f1] border border-[#7a222b]/30 rounded-sm text-xs text-[#7a222b] flex items-start gap-2.5 font-mono">
                <AlertCircle className="w-4 h-4 text-[#7a222b] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#78716c] mb-1.5 font-medium tracking-wider">
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gardenia.local"
                  className="w-full bg-[#faf7f2] border border-[#ded8ce] rounded-sm px-3.5 py-2.5 text-xs text-[#1c1917] focus:outline-none focus:border-[#244034] font-mono transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#78716c] mb-1.5 font-medium tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#faf7f2] border border-[#ded8ce] rounded-sm px-3.5 py-2.5 text-xs text-[#1c1917] focus:outline-none focus:border-[#244034] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#244034] hover:bg-[#1a2f26] text-[#faf7f2] rounded-sm font-medium text-xs tracking-wider uppercase transition-all cursor-pointer mt-2 disabled:opacity-50 flex items-center justify-center gap-2 group shadow-xs"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="w-3.5 h-3.5 text-[#ede7de] group-hover:translate-x-0.5 transition-transform" />}
              </button>
            </form>
          </div>

          {/* Discreet Demo Accounts Reference */}
          <div className="mt-8 pt-4 border-t border-[#e8e3da]">
            <button
              type="button"
              onClick={() => setShowDemoGuide(!showDemoGuide)}
              className="w-full flex items-center justify-between text-[11px] font-mono text-[#78716c] hover:text-[#1c1917] cursor-pointer"
            >
              <span>Demo Accounts Reference (Gardenia 2K26)</span>
              {showDemoGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemoGuide && (
              <div className="mt-3 space-y-2 text-[11px] font-mono bg-[#f5f0e6]/70 p-3 rounded-sm border border-[#e8e3da]">
                {[
                  { label: 'Dr. Anita Rao', role: 'Sponsor', email: 'sponsor.demo@gardenia.local', pass: 'Demo@2026' },
                  { label: 'Priya Sharma', role: 'Student 1', email: 'student.demo@gardenia.local', pass: 'Demo@2026' },
                  { label: 'Arun Kumar', role: 'Student 2', email: 'student2.demo@gardenia.local', pass: 'Demo@2026' },
                  { label: 'Prof. Kiran Shah', role: 'Expert', email: 'expert.demo@gardenia.local', pass: 'Demo@2026' },
                  { label: 'Admin', role: 'Admin', email: 'admin.demo@gardenia.local', pass: 'Admin@2026' },
                ].map((acc) => (
                  <div
                    key={acc.email}
                    onClick={() => handleSelectDemoAccount(acc.email, acc.pass)}
                    className="p-1.5 hover:bg-white rounded-sm cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-semibold text-[#1c1917]">{acc.label}</span>{' '}
                      <span className="text-[#78716c]">({acc.role})</span>
                    </div>
                    <span className="text-[10px] text-[#244034] group-hover:underline">fill</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-6 border-t border-[#e8e3da] text-center text-xs text-[#78716c] font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>AGENT FIREWALL · MULTI-USER RESEARCH COLLABORATION</div>
        <div>SERVER-SIDE RBAC ENFORCED · SHA-256 LEDGER AUDIT</div>
      </footer>
    </div>
  );
};
