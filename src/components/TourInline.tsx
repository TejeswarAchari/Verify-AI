import React, { useState } from 'react';
import { ExternalLink, Check, ArrowRight, ArrowLeft, Key, Sparkles, CheckCircle2, MousePointerClick } from 'lucide-react';
import { store } from '../services/store';
import { testGeminiApiKey } from '../services/analyze';

interface TourInlineProps {
  onComplete: () => void;
  onApiKeySaved?: (key: string) => void;
}

export const TourInline: React.FC<TourInlineProps> = ({ onComplete, onApiKeySaved }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tourKey, setTourKey] = useState(store.getApiKey());
  const [savingKey, setSavingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourKey.trim()) return;

    setSavingKey(true);
    setKeyStatus(null);

    const result = await testGeminiApiKey(tourKey);
    setSavingKey(false);
    setKeyStatus(result);

    if (result.ok) {
      await store.setApiKey(tourKey);
      if (onApiKeySaved) onApiKeySaved(tourKey);
    }
  };

  const handleFinish = async () => {
    await store.setTourCompleted(true);
    onComplete();
  };

  const handleSkip = async () => {
    await store.setTourCompleted(true);
    onComplete();
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/70 border border-indigo-200/80 rounded-2xl p-4 flex flex-col gap-3.5 my-1 text-slate-900 shadow-sm animate-fadeIn">
      {/* Header with Step Indicator and Skip */}
      <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            <span className={`h-1.5 w-5 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            <span className={`h-1.5 w-5 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            <span className={`h-1.5 w-5 rounded-full ${step === 3 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          </div>
          <span className="text-[11px] font-bold text-indigo-700 ml-1">
            Step {step} of 3
          </span>
        </div>
        <button
          type="button"
          onClick={handleSkip}
          className="text-[11.5px] font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          Skip tour
        </button>
      </div>

      {/* Step 1: Add Gemini Key */}
      {step === 1 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-indigo-700">
              <Key className="w-4 h-4" />
              <h3 className="text-[14px] font-bold tracking-tight">
                Add Your Free Gemini API Key
              </h3>
            </div>
            <p className="text-[12px] leading-relaxed text-slate-600">
              Verify AI operates directly inside Chrome. Analysis calls are sent from your browser to Google AI Studio using your personal key.
            </p>
          </div>

          <form onSubmit={handleSaveKey} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="password"
                value={tourKey}
                onChange={(e) => {
                  setTourKey(e.target.value);
                  setKeyStatus(null);
                }}
                placeholder="AIzaSy..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-mono text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none shadow-xs"
              />
              <button
                type="submit"
                disabled={savingKey || !tourKey.trim()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-[12px] font-semibold transition-all cursor-pointer shadow-xs shrink-0"
              >
                {savingKey ? 'Validating...' : 'Save & Test'}
              </button>
            </div>

            {keyStatus && (
              <p
                className={`text-[11px] flex items-center gap-1 font-medium ${
                  keyStatus.ok ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {keyStatus.ok && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                {keyStatus.message}
              </p>
            )}

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11.5px] font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 mt-0.5"
            >
              <span>Get a free key from Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </form>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-8 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Check Anything */}
      {step === 2 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-indigo-700">
              <MousePointerClick className="w-4 h-4" />
              <h3 className="text-[14px] font-bold tracking-tight">
                Inspect Anything in 1 Click
              </h3>
            </div>
            <p className="text-[12px] leading-relaxed text-slate-600">
              Three seamless ways to evaluate suspicious content on any website:
            </p>
          </div>

          <div className="flex flex-col gap-2 text-[12px] text-slate-700">
            <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                A
              </div>
              <span className="leading-snug">
                <strong>Right-click selection:</strong> Highlight text or right-click any link &rarr; choose &ldquo;Check with Verify AI&rdquo;.
              </span>
            </div>
            <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                B
              </div>
              <span className="leading-snug">
                <strong>Keyboard shortcut:</strong> Press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px] border border-slate-200 text-slate-800">Alt+Shift+V</kbd> to inspect the active text instantly.
              </span>
            </div>
            <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                C
              </div>
              <span className="leading-snug">
                <strong>Manual paste:</strong> Paste raw text or links directly into the Check tab.
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-8 px-3 text-[12px] font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="h-8 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Read the Result */}
      {step === 3 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-indigo-700">
              <CheckCircle2 className="w-4 h-4" />
              <h3 className="text-[14px] font-bold tracking-tight">
                Clear, Calibrated Security Intel
              </h3>
            </div>
            <p className="text-[12px] leading-relaxed text-slate-600">
              Actionable results designed for immediate decision making:
            </p>
          </div>

          <div className="flex flex-col gap-2 text-[12px] text-slate-700">
            <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>Verdict &amp; Score:</strong> Immediate risk classification with a 0-100 calibrated risk index.</span>
            </div>
            <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span><strong>Exact Highlighted Quotes:</strong> Suspicious phrases highlighted inline matching specific deception patterns.</span>
            </div>
            <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <span><strong>Direct Action Directives:</strong> Clear bullet points telling you exactly what steps to take.</span>
            </div>
          </div>

          <div className="flex justify-between pt-1">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-8 px-3 text-[12px] font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="h-8 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-[12px] font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-500/20"
            >
              <span>Get Started</span>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
