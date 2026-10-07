import React from 'react';
import { Clipboard, KeyRound, Sparkles, AlertCircle, ArrowRight, Zap } from 'lucide-react';

interface EmptyStateProps {
  inputText: string;
  setInputText: (text: string) => void;
  onAnalyze: () => void;
  hasApiKey: boolean;
  onOpenSettings: () => void;
  isAnalyzing: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  inputText,
  setInputText,
  onAnalyze,
  hasApiKey,
  onOpenSettings,
  isAnalyzing,
}) => {
  const handlePasteClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        setInputText(clip);
      }
    } catch {
      // Ignore if clipboard permission not granted
    }
  };

  const isOverLimit = inputText.length > 6000;
  const canAnalyze = Boolean(inputText.trim()) && !isOverLimit && hasApiKey && !isAnalyzing;

  return (
    <div className="flex flex-col gap-3 py-1">
      {/* Extension Feature Banner */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[12.5px] font-semibold text-slate-900 tracking-tight">
              Scam &amp; Phishing Detection
            </h2>
            <p className="text-[11.5px] leading-relaxed text-slate-600 mt-0.5">
              Select text on any webpage, right-click &amp; choose <strong className="text-slate-800 font-medium">Check with Verify AI</strong> (<kbd className="px-1 py-0.5 rounded bg-slate-200/80 text-[10px] font-mono text-slate-700">Alt+Shift+V</kbd>), or paste content below to evaluate.
            </p>
          </div>
        </div>
      </div>

      {/* Missing API Key Warning Callout */}
      {!hasApiKey && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col gap-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-amber-900">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>Gemini API Key Required</span>
          </div>
          <p className="text-[11.5px] leading-relaxed text-amber-800 font-sans">
            Add your Google AI Studio key in Settings to analyze suspicious messages and phishing links.
          </p>
          <div className="pt-0.5">
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-amber-900 hover:text-amber-950 underline cursor-pointer"
            >
              <span>Configure API key in Settings</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input Field Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
            PASTE CONTENT OR URL
          </span>
          <button
            type="button"
            onClick={handlePasteClipboard}
            className="hover:text-indigo-600 text-slate-600 inline-flex items-center gap-1 transition-colors cursor-pointer font-sans text-[11px] font-medium"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste clipboard</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste suspicious SMS, email, WhatsApp message, crypto offer, or URL..."
            rows={7}
            className={`w-full bg-white border rounded-xl p-3 text-[12.5px] font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all resize-none leading-relaxed shadow-2xs ${
              isOverLimit
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
            }`}
          />
          {inputText && (
            <div
              className={`absolute right-2.5 bottom-2.5 text-[10.5px] font-mono px-1.5 py-0.5 rounded-md ${
                isOverLimit
                  ? 'bg-rose-100 text-rose-700 font-bold'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {inputText.length.toLocaleString()}/6,000 chars
            </div>
          )}
        </div>

        {isOverLimit && (
          <p className="text-[11.5px] font-sans text-rose-600 leading-tight flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Input exceeds 6,000 character limit. Reduce text length before analyzing.</span>
          </p>
        )}
      </div>

      {/* Primary Analyze Button */}
      <button
        type="button"
        onClick={onAnalyze}
        disabled={!canAnalyze}
        className={`w-full py-2.5 px-4 text-[13px] font-semibold font-sans rounded-xl transition-all duration-150 text-center flex items-center justify-center gap-2 ${
          canAnalyze
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-[0.99] cursor-pointer'
            : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>{isAnalyzing ? 'Analyzing with Verify AI...' : 'Verify Content'}</span>
      </button>
    </div>
  );
};
