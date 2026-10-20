import React from 'react';
import { User, UserRole } from '../types';
import { Shield, LogOut, CheckCircle2, AlertOctagon, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  ledgerValid: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  activeTab,
  setActiveTab,
  ledgerValid,
}) => {
  // Role-Aware Navigation Configuration (Section 25)
  const getNavItems = (role: UserRole) => {
    switch (role) {
      case 'sponsor':
        return [
          { id: 'dashboard', label: 'Overview' },
          { id: 'projects', label: 'My Initiatives' },
          { id: 'workspace', label: 'Project Workspace' },
          { id: 'review', label: 'Submissions & Review' },
          { id: 'rewards', label: 'Settlement & Escrow' },
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'Overview' },
          { id: 'projects', label: 'Discover Initiatives' },
          { id: 'workspace', label: 'Research Workspace' },
          { id: 'review', label: 'My Submissions' },
          { id: 'rewards', label: 'Attribution & Rewards' },
        ];
      case 'expert':
        return [
          { id: 'dashboard', label: 'Overview' },
          { id: 'projects', label: 'Initiatives' },
          { id: 'review', label: 'Clinical Review & Scoring' },
          { id: 'workspace', label: 'Workspace' },
          { id: 'rewards', label: 'Settlements & Citations' },
        ];
      case 'admin':
      default:
        return [
          { id: 'dashboard', label: 'Overview' },
          { id: 'projects', label: 'Initiatives' },
          { id: 'workspace', label: 'Workspace' },
          { id: 'review', label: 'Review' },
          { id: 'rewards', label: 'Settlements' },
          { id: 'ledger', label: 'Ledger Audit' },
          { id: 'simulator', label: 'Policy Simulator' },
          { id: 'disputes', label: 'Disputes' },
          { id: 'admin', label: 'Admin Console' },
        ];
    }
  };

  const navItems = getNavItems(currentUser.role);

  return (
    <header className="border-b border-[#e7e2d9] bg-[#fbfaf8] text-[#1c1917] sticky top-0 z-50">
      {/* Top Protocol Strip */}
      <div className="bg-[#f5f3ef] border-b border-[#e7e2d9] px-4 sm:px-6 py-1.5 text-xs text-[#78716c] flex items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#1c1917] tracking-wider uppercase">Agent Firewall</span>
          <span className="text-[#d6cebf]">/</span>
          <span className="italic text-[#78716c] hidden md:inline">“AI can act. AI cannot decide what it is allowed to do.”</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-[#a8a29e]">LEDGER:</span>
            {ledgerValid ? (
              <span className="text-[#2d4a3e] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#2d4a3e]" />
                VERIFIED
              </span>
            ) : (
              <span className="text-[#7a222b] font-bold flex items-center gap-1 bg-[#fbf0f1] px-1.5 py-0.5 rounded border border-[#7a222b]/30">
                <AlertOctagon className="w-3 h-3 text-[#7a222b]" />
                TAMPER DETECTED
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[#78716c]">
            <span className="text-[#a8a29e]">MODE:</span>
            <span>DETERMINISTIC MOCK</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Editorial Title */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded bg-[#2d4a3e] text-[#fbfaf8] flex items-center justify-center shadow-xs">
              <Shield className="w-4 h-4 text-[#e7e2d9]" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-[#1c1917] font-serif uppercase">
                Agent Firewall
              </div>
              <div className="text-[10px] text-[#78716c] font-mono tracking-wider">
                GARDENIA 2K26 FINALS
              </div>
            </div>
          </button>

          {/* Role-Specific Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 text-xs">
            {navItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer font-medium ${
                  activeTab === tab.id
                    ? 'bg-[#ede9e3] text-[#1c1917] font-semibold border border-[#d6cebf]'
                    : 'text-[#57534e] hover:text-[#1c1917] hover:bg-[#f5f3ef]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Authenticated User Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-[#1c1917]">{currentUser.name}</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#78716c]">
              {currentUser.role}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 sm:px-3 sm:py-1.5 text-xs text-[#57534e] hover:text-[#7a222b] hover:bg-[#fbf0f1] border border-[#e7e2d9] rounded flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Sign out of authenticated session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
