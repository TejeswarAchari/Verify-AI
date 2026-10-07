import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Check, Flag, Copy, RotateCcw } from 'lucide-react';
import { store } from '../services/store';

interface FooterActionsProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const FooterActions: React.FC<FooterActionsProps> = ({ result, onReset }) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [reported, setReported] = useState(false);
  const [reportHash, setReportHash] = useState<string | null>(null);

  const handleCopySummary = () => {
    const textLines = [
      `[Verify AI Assessment]`,
      `Verdict: ${result.verdictLabel} (${result.score}/100)`,
      `Classification: ${result.scamType}`,
      ``,
      `Original text:`,
      `"${result.text}"`,
      ``,
      `Reasons:`,
      ...result.reasons.map(
        (r) => `${r.id}. ${r.label} [${r.severity}]: ${r.explanation}`
      ),
      ``,
      `Action items:`,
      ...result.imperatives.map((imp, i) => `${i + 1}. ${imp}`),
    ].join('\n');

    navigator.clipboard.writeText(textLines).catch(() => {});
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 1500);
  };

  const handleReport = async () => {
    const record = await store.reportPattern({
      text: result.text,
      scamType: result.scamType,
      verdict: result.verdict,
      timestamp: new Date().toISOString(),
    });
    setReportHash(record.textHash.slice(0, 8));
    setReported(true);
    setTimeout(() => {
      setReported(false);
      setReportHash(null);
    }, 3500);
  };

  return (
    <div className="pt-2 pb-4 flex flex-col gap-2.5 border-t border-slate-200">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleReport}
          disabled={reported}
          className="text-[12px] font-sans text-slate-500 hover:text-slate-800 transition-colors py-1 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Flag className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {reported
              ? `Reported (#${reportHash})`
              : 'Report scam pattern'}
          </span>
        </button>

        <button
          type="button"
          onClick={handleCopySummary}
          className={`h-8 px-3 text-[12px] font-semibold font-sans rounded-lg border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
            copiedSummary
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
          }`}
        >
          {copiedSummary ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              <span>Copied report</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy report</span>
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full py-2.5 px-3 text-[12.5px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
        <span>Check Another Message</span>
      </button>
    </div>
  );
};
