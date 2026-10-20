import React from 'react';
import { ShieldAlert, RefreshCw, Activity, AlertOctagon, Wrench } from 'lucide-react';

interface DemoFlowBarProps {
  currentStep: number;
  onSelectStep: (stepNumber: number) => void;
  onTriggerStarScene: () => void;
  onTriggerTamper: () => void;
  onTriggerRepair: () => void;
}

export const DEMO_STEPS = [
  { step: 1, title: '1. POST', tag: 'INITIATIVE', desc: 'Create & publish diabetic retinopathy initiative' },
  { step: 2, title: '2. SCOPE & MATCH', tag: 'SCOPING', desc: 'Propose milestones + Filter COI expert' },
  { step: 3, title: '3. JOIN & FUND', tag: 'ACCESS', desc: 'Charter ack + 403 test + Escrow HELD' },
  { step: 4, title: '4. STAR SCENE', tag: 'FIREWALL', desc: 'Poisoned PDF attack → HARD RED BLOCK' },
  { step: 5, title: '5. ACCEPT & REWARD', tag: 'SETTLEMENT', desc: 'Review + ₹1,00,000 split + 100 CU awards' },
  { step: 6, title: '6. VERIFY & TAMPER', tag: 'LEDGER', desc: 'Cryptographic audit + Tamper twist' },
];

export const DemoFlowBar: React.FC<DemoFlowBarProps> = ({
  currentStep,
  onSelectStep,
  onTriggerStarScene,
  onTriggerTamper,
  onTriggerRepair,
}) => {
  return (
    <div className="bg-[#f5f3ef] border-b border-[#e7e2d9] px-4 py-2 text-[#1c1917]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Stepper Title */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#2d4a3e] font-bold bg-[#eef3f0] px-2 py-0.5 rounded border border-[#2d4a3e]/30">
            ADMIN DEMO CONTROLS
          </span>
          <span className="text-xs text-[#78716c] hidden sm:inline">5-Minute Finals Script Walkthrough:</span>
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {DEMO_STEPS.map((s) => {
            const isActive = currentStep === s.step;
            return (
              <button
                key={s.step}
                onClick={() => onSelectStep(s.step)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#2d4a3e] text-white font-semibold shadow-xs'
                    : 'bg-[#ede9e3] hover:bg-[#e4ded5] text-[#44403c] border border-[#d6cebf]'
                }`}
                title={s.desc}
              >
                <span>{s.title}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${isActive ? 'bg-[#1e332a] text-[#eef3f0]' : 'bg-[#e0d9ce] text-[#57534e]'}`}>
                  {s.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Demo Triggers */}
        <div className="flex items-center gap-1.5 self-end md:self-auto">
          <button
            onClick={onTriggerStarScene}
            className="text-[11px] px-2.5 py-1 bg-[#fbf0f1] hover:bg-[#f5e0e3] text-[#7a222b] border border-[#7a222b]/40 rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
            title="Execute the star demonstration scene: Research Agent reads poisoned PDF and gets blocked!"
          >
            <ShieldAlert className="w-3 h-3 text-[#7a222b]" />
            <span>Run Star Scene</span>
          </button>
          <button
            onClick={onTriggerTamper}
            className="text-[11px] px-2.5 py-1 bg-[#fef9ee] hover:bg-[#fcf1db] text-[#854d0e] border border-[#854d0e]/40 rounded font-medium cursor-pointer transition-colors"
            title="Tamper an old ledger entry to trigger HASH_MISMATCH"
          >
            Tamper Twist
          </button>
          <button
            onClick={onTriggerRepair}
            className="text-[11px] px-2.5 py-1 bg-[#ede9e3] hover:bg-[#e4ded5] text-[#44403c] border border-[#d6cebf] rounded font-medium cursor-pointer transition-colors"
            title="Restore ledger to verified pristine state"
          >
            Repair
          </button>
        </div>
      </div>
    </div>
  );
};
