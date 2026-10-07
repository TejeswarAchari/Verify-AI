import React from 'react';
import { Reason, VerdictType } from '../types';
import { HelpCircle, ChevronRight } from 'lucide-react';

interface WhyListProps {
  reasons: Reason[];
  verdict: VerdictType;
  selectedReasonId: number | null;
  onSelectReason: (id: number) => void;
}

export const WhyList: React.FC<WhyListProps> = ({
  reasons,
  selectedReasonId,
  onSelectReason,
}) => {
  if (!reasons || reasons.length === 0) return null;

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'moderate':
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] font-sans">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold uppercase tracking-wider text-[10.5px]">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Evidence & Risk Factors</span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium font-sans">
          {reasons.length} {reasons.length === 1 ? 'signal' : 'signals'} detected
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {reasons.map((reason) => {
          const isSelected = selectedReasonId === reason.id;
          return (
            <div
              key={reason.id}
              id={`reason-${reason.id}`}
              onClick={() => onSelectReason(reason.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
              }`}
            >
              {/* Header row: Number + Label + Severity tag */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10.5px] font-bold flex items-center justify-center shrink-0">
                    {reason.id}
                  </span>
                  <span className="font-semibold text-[13px] text-slate-900 truncate font-sans">
                    {reason.label}
                  </span>
                </div>

                <span className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${getSeverityBadge(reason.severity)}`}>
                  {reason.severity}
                </span>
              </div>

              {/* Quoted phrase in mono */}
              {reason.quote && (
                <div className="mb-2 text-[11px] font-mono text-slate-700 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border-l-2 border-indigo-500 break-all select-text">
                  &ldquo;{reason.quote}&rdquo;
                </div>
              )}

              {/* Plain-English explanation */}
              <p className="text-[12px] leading-relaxed text-slate-600 font-sans">
                {reason.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
