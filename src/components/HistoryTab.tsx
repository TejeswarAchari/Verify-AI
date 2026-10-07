import React, { useState } from 'react';
import { AnalysisResult, VerdictType } from '../types';
import { ChevronDown, ChevronUp, Trash2, ArrowRight, Clock, AlertTriangle } from 'lucide-react';

interface HistoryTabProps {
  history: AnalysisResult[];
  onSelectResult: (result: AnalysisResult) => void;
  onClearHistory: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  history,
  onSelectResult,
  onClearHistory,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const getVerdictTheme = (verdict: VerdictType) => {
    switch (verdict) {
      case 'safe':
        return {
          dot: 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          text: 'text-emerald-700',
        };
      case 'suspicious':
        return {
          dot: 'bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          text: 'text-amber-700',
        };
      case 'high_risk':
      default:
        return {
          dot: 'bg-rose-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          text: 'text-rose-700',
        };
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (history.length === 0) {
    return (
      <div className="py-8 flex flex-col gap-3 items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-[13px] font-semibold text-slate-700">No Past Scans Yet</h4>
          <p className="text-[11.5px] text-slate-500 mt-1 max-w-[240px]">
            Checked items will appear here and are stored locally on your device for 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 py-1 animate-fadeIn">
      {/* 24-Hour Notice Header */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-200 pb-2">
        <span className="flex items-center gap-1 font-sans">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Kept locally for 24 hours</span>
        </span>

        {confirmClear ? (
          <div className="flex items-center gap-2">
            <span className="text-rose-600 font-semibold text-[11px]">Delete all?</span>
            <button
              type="button"
              onClick={() => {
                onClearHistory();
                setConfirmClear(false);
              }}
              className="text-rose-600 hover:underline font-bold text-[11px] cursor-pointer"
            >
              Confirm
            </button>
            <span className="text-slate-300">/</span>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="text-slate-500 hover:text-slate-800 text-[11px] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="hover:text-rose-600 text-slate-500 inline-flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear history</span>
          </button>
        )}
      </div>

      {/* History Cards List */}
      <div className="flex flex-col gap-2">
        {history.map((item) => {
          const isExpanded = expandedId === item.id;
          const snippet = item.text.length > 70 ? `${item.text.slice(0, 70)}…` : item.text;
          const theme = getVerdictTheme(item.verdict);

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all shadow-2xs hover:border-slate-300"
            >
              {/* Row header */}
              <div
                onClick={() => toggleExpand(item.id)}
                className="p-3 flex items-start gap-2.5 cursor-pointer hover:bg-slate-50/70 select-none"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand(item.id);
                  }
                }}
              >
                {/* Status Dot */}
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${theme.dot}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.2 rounded-md border ${theme.badge}`}>
                      {item.scamType}
                    </span>
                    <span className="text-[10.5px] text-slate-400 font-sans">
                      {item.relativeTime}
                    </span>
                  </div>

                  <p className="font-mono text-[11.5px] text-slate-800 line-clamp-1 truncate">
                    {snippet}
                  </p>
                </div>

                <div className="text-slate-400 shrink-0 pt-0.5">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Inline expanded details */}
              {isExpanded && (
                <div className="px-3.5 pb-3 pt-2 border-t border-slate-100 bg-slate-50/70 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[11.5px] font-sans">
                    <span className="text-slate-500 font-medium">Verdict:</span>
                    <span className={`font-bold ${theme.text}`}>
                      {item.verdictLabel} ({item.score}/100 Risk)
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11.5px] text-slate-700 leading-relaxed break-words">
                    {item.text}
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {item.reasons.length} risk signals identified
                    </span>

                    <button
                      type="button"
                      onClick={() => onSelectResult(item)}
                      className="h-7 px-2.5 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                      <span>Load into Check</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
