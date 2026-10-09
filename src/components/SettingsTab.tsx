import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, Key, CheckCircle2, Trash2, RotateCcw, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import { store } from '../services/store';
import { testGeminiApiKey } from '../services/analyze';

interface SettingsTabProps {
  onApiKeyUpdated?: (key: string) => void;
  onReplayTour?: () => void;
  onHistoryCleared?: () => void;
  onAllDataCleared?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  onApiKeyUpdated,
  onReplayTour,
  onHistoryCleared,
  onAllDataCleared,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [autoScanSelection, setAutoScanSelection] = useState(true);
  const [strictLookalike, setStrictLookalike] = useState(true);
  const [reportedCount, setReportedCount] = useState(0);

  // Confirmation states
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    setApiKey(store.getApiKey());
    setReportedCount(store.getReportedPatterns().length);
  }, []);

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKey.trim();

    if (!trimmed) {
      await store.setApiKey('');
      setTestResult({ ok: false, message: 'API key cleared.' });
      if (onApiKeyUpdated) onApiKeyUpdated('');
      return;
    }

    setTestingKey(true);
    setTestResult(null);

    const res = await testGeminiApiKey(trimmed);
    setTestingKey(false);
    setTestResult(res);

    if (res.ok) {
      await store.setApiKey(trimmed);
      if (onApiKeyUpdated) onApiKeyUpdated(trimmed);
    }
  };

  const handleClearHistory = async () => {
    await store.clearHistory();
    setConfirmClearHistory(false);
    if (onHistoryCleared) onHistoryCleared();
  };

  const handleClearAllData = async () => {
    await store.clearAllData();
    setApiKey('');
    setTestResult(null);
    setReportedCount(0);
    setConfirmClearAll(false);
    if (onAllDataCleared) onAllDataCleared();
  };

  return (
    <div className="flex flex-col gap-4 py-2 animate-fadeIn font-sans">
      {/* Section 1: Engine & Credentials */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          AI Engine &amp; Credentials
        </span>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
        >
          <span>Get Free Key</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <form onSubmit={handleSaveAndTest} className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-[12.5px] font-semibold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-500" />
              <span>Gemini API Key</span>
            </span>
            {apiKey.trim() ? (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                ACTIVE
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                MISSING
              </span>
            )}
          </label>

          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="Paste your Google AI Studio API key"
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-3 pr-9 text-[12.5px] font-mono text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none transition-all shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-2.5 rounded-lg border text-[11.5px] flex items-center gap-2 ${
                testResult.ok
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {testResult.ok ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <p className="text-[11px] leading-relaxed text-slate-500">
            Stored locally in Chrome extension storage. Never sent to third parties.
          </p>
        </div>

        {/* Save & Test Button */}
        <div>
          <button
            type="submit"
            disabled={testingKey}
            className="w-full py-2.5 px-4 text-[12.5px] font-semibold rounded-xl transition-all inline-flex items-center justify-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer shadow-xs active:scale-[0.99]"
          >
            {testingKey ? (
              <span>Validating with Google Gemini...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Save &amp; Test Connection</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Section 2: Preferences */}
      <div className="pt-1 flex flex-col gap-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Extension Preferences
        </div>

        <div className="flex flex-col divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
          <label className="p-3 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[12.5px] font-semibold text-slate-900">
                Right-Click Context Menu
              </span>
              <span className="text-[11px] text-slate-500">
                Show &quot;Check with Verify AI&quot; on webpage text selections
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoScanSelection}
              onChange={(e) => setAutoScanSelection(e.target.checked)}
              className="mt-1 accent-indigo-600 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className="p-3 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[12.5px] font-semibold text-slate-900">
                Strict Lookalike URL Heuristic
              </span>
              <span className="text-[11px] text-slate-500">
                Pre-flag punycode, unusual TLDs (.top, .xyz), and IP hosts locally
              </span>
            </div>
            <input
              type="checkbox"
              checked={strictLookalike}
              onChange={(e) => setStrictLookalike(e.target.checked)}
              className="mt-1 accent-indigo-600 w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Section 3: Data Management & Tour */}
      <div className="pt-1 flex flex-col gap-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Data Management
        </div>

        <div className="flex flex-col divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
          {/* Replay Tour */}
          {onReplayTour && (
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[12.5px] font-semibold text-slate-900">First-Run Tour</span>
                <span className="text-[11px] text-slate-500">Revisit the interactive walkthrough</span>
              </div>
              <button
                type="button"
                onClick={onReplayTour}
                className="h-7 px-3 text-[11px] font-semibold border border-slate-200 hover:bg-slate-100 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>
            </div>
          )}

          {/* Clear History Now */}
          <div className="p-3 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-[12.5px] font-semibold text-slate-900">Clear History Cache</span>
              <span className="text-[11px] text-slate-500">Delete all local scan results immediately</span>
            </div>

            {confirmClearHistory ? (
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  Confirm
                </button>
                <span className="text-slate-300">/</span>
                <button
                  type="button"
                  onClick={() => setConfirmClearHistory(false)}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClearHistory(true)}
                className="h-7 px-3 text-[11px] font-semibold border border-slate-200 hover:text-rose-600 hover:border-rose-200 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Clear All Data */}
          <div className="p-3 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-[12.5px] font-semibold text-rose-600">Reset All Data</span>
              <span className="text-[11px] text-slate-500">Wipes API key, history, and preferences</span>
            </div>

            {confirmClearAll ? (
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={handleClearAllData}
                  className="text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  Wipe
                </button>
                <span className="text-slate-300">/</span>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                className="h-7 px-3 text-[11px] font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Anonymous threat reports cache */}
      <div className="p-3 bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold text-slate-800">Local Threat Registry</span>
            <span className="text-[10.5px] font-mono text-slate-500">
              {reportedCount} anonymized pattern hashes
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
          no raw text
        </span>
      </div>

      {/* Build metadata */}
      <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-200">
        <span>Verify AI v1.0.0</span>
        <span>Manifest V3 • Flash 2.5</span>
      </div>
    </div>
  );
};
