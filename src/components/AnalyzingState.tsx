import React, { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface AnalyzingStateProps {
  text: string;
  onCancel?: () => void;
}

const STATUS_STEPS = [
  'Reading message context',
  'Analyzing link reputations',
  'Evaluating urgency & pressure intent',
  'Comparing known scam patterns',
];

export const AnalyzingState: React.FC<AnalyzingStateProps> = ({ text, onCancel }) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STATUS_STEPS.length);
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 py-2 animate-fadeIn">
      {/* Dynamic Status Header */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 text-slate-800 font-sans">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600" />
          </div>
          <span className="text-[12.5px] font-semibold">{STATUS_STEPS[stepIndex]}...</span>
        </div>
        <span className="text-[11px] font-mono font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
          Step {stepIndex + 1}/4
        </span>
      </div>

      {/* Submitted text with scan animation */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10.5px] font-sans font-semibold text-slate-400 uppercase tracking-wider">
          <span>Input Analysis</span>
          <span className="font-mono text-indigo-600">Gemini 2.5 Flash</span>
        </div>
        
        <div className="relative overflow-hidden bg-white border border-slate-200 rounded-xl p-3.5 min-h-[140px] text-[12px] font-mono leading-relaxed text-slate-700 break-words whitespace-pre-wrap select-none shadow-2xs">
          {text}

          {/* Clean scan indicator line */}
          <div
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80 animate-scanline pointer-events-none"
            aria-hidden="true"
          />

          {/* Soft sweep wash */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none animate-scanline"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-sans text-slate-500 pt-1">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Intent and authenticity evaluation in progress</span>
        </span>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Cancel</span>
          </button>
        )}
      </div>
    </div>
  );
};
