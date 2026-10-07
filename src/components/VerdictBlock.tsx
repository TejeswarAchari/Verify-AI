import React from 'react';
import { VerdictType } from '../types';
import { TickMeter } from './TickMeter';
import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface VerdictBlockProps {
  verdict: VerdictType;
  verdictLabel: string;
  scamType: string;
  score: number;
}

export const VerdictBlock: React.FC<VerdictBlockProps> = ({
  verdict,
  verdictLabel,
  scamType,
  score,
}) => {
  const getVerdictTheme = () => {
    switch (verdict) {
      case 'safe':
        return {
          textColor: 'text-emerald-700',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          containerBg: 'bg-emerald-50/50 border-emerald-200/90 shadow-2xs',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.2]" />,
          iconBg: 'bg-emerald-100 text-emerald-700',
        };
      case 'suspicious':
        return {
          textColor: 'text-amber-700',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          containerBg: 'bg-amber-50/50 border-amber-200/90 shadow-2xs',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 stroke-[2.2]" />,
          iconBg: 'bg-amber-100 text-amber-700',
        };
      case 'high_risk':
      default:
        return {
          textColor: 'text-rose-700',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
          containerBg: 'bg-rose-50/50 border-rose-200/90 shadow-2xs',
          icon: <AlertOctagon className="w-5 h-5 text-rose-600 stroke-[2.2]" />,
          iconBg: 'bg-rose-100 text-rose-700',
        };
    }
  };

  const theme = getVerdictTheme();

  return (
    <div className={`border rounded-2xl p-4 transition-all ${theme.containerBg}`}>
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBg} shadow-2xs`}>
            {theme.icon}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              Classification
            </span>
            <h2 className={`text-[22px] leading-tight font-extrabold tracking-tight font-sans ${theme.textColor}`}>
              {verdictLabel}
            </h2>
          </div>
        </div>

        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border max-w-[150px] truncate uppercase tracking-wider ${theme.badgeBg}`}>
          {scamType}
        </span>
      </div>

      <TickMeter score={score} verdict={verdict} />
    </div>
  );
};
