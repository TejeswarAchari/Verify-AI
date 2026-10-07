import { useState, useEffect, useRef } from 'react';
import {
  AnalysisResult,
  CheckState,
  ErrorType,
  TabType,
  VerdictType,
} from './types';
import { Header } from './components/Header';
import { VerdictBlock } from './components/VerdictBlock';
import { WhatWeSaw } from './components/WhatWeSaw';
import { WhyList } from './components/WhyList';
import { LinksSection } from './components/LinksSection';
import { DoThisSection } from './components/DoThisSection';
import { FooterActions } from './components/FooterActions';
import { AnalyzingState } from './components/AnalyzingState';
import { EmptyState } from './components/EmptyState';
import { ErrorInline } from './components/ErrorInline';
import { HistoryTab } from './components/HistoryTab';
import { SettingsTab } from './components/SettingsTab';
import { TourInline } from './components/TourInline';
import { analyzeContent, AnalysisError } from './services/analyze';
import { store } from './services/store';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('check');

  // Check Tab Workflow State (Genuinely empty initial state)
  const [checkState, setCheckState] = useState<CheckState>('empty');
  const [errorType, setErrorType] = useState<ErrorType>('bad_key');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');

  // Active result loaded in Check tab (null on first run)
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);

  // Selected reason for bidirectional highlighting
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);

  // History state loaded from store (persistent, with 24h expiry)
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  // First-run tour state
  const [showTour, setShowTour] = useState<boolean>(false);

  // Analysis in-flight guard to prevent duplicate submissions
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const inFlightRef = useRef<boolean>(false);

  // Setup: Hydrate storage, check pending items, and manage 24h expiry timers
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const startup = async () => {
      await store.ready();
      setShowTour(!store.getTourCompleted());
      setHistory(store.getHistory());

      // 1. Check for pending item from context-menu or keyboard shortcut
      const pending = await store.getPendingCheck();
      if (pending?.text) {
        await store.clearPendingCheck();
        setInputText(pending.text);
        setActiveTab('check');
        handleStartAnalysis(pending.text);
      }

      // 2. Subscribe to storage session changes while side panel is open
      unsubscribe = store.subscribeToPendingCheck(async (item) => {
        if (item?.text) {
          await store.clearPendingCheck();
          setInputText(item.text);
          setActiveTab('check');
          handleStartAnalysis(item.text);
        }
      });
    };

    startup();

    // 10-minute interval to automatically purge items older than 24 hours
    const expiryInterval = setInterval(() => {
      store.purgeExpiredHistory();
      setHistory(store.getHistory());
    }, 10 * 60 * 1000);

    // 1-minute interval to keep relative timestamps accurate
    const relativeTimeInterval = setInterval(() => {
      setHistory(store.getHistory());
    }, 60 * 1000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(expiryInterval);
      clearInterval(relativeTimeInterval);
    };
  }, []);

  // Analysis execution workflow
  const handleStartAnalysis = async (textToAnalyze?: string) => {
    // In-flight guard
    if (inFlightRef.current) return;

    const text = (textToAnalyze !== undefined ? textToAnalyze : inputText).trim();
    if (!text) {
      setErrorType('generic');
      setErrorMessage('No text provided to evaluate.');
      setCheckState('error');
      return;
    }

    // 6,000 character limit check
    if (text.length > 6000) {
      setErrorType('text_too_long');
      setErrorMessage(
        `Input text is ${text.length.toLocaleString()} characters. The maximum supported window is 6,000 characters.`
      );
      setCheckState('error');
      return;
    }

    // API Key verification check
    const apiKey = store.getApiKey();
    if (!store.hasKey()) {
      setErrorType('bad_key');
      setErrorMessage(
        'No Gemini API key configured. Open Settings to set and test your key.'
      );
      setCheckState('error');
      return;
    }

    inFlightRef.current = true;
    setIsAnalyzing(true);
    setCheckState('analyzing');
    setSelectedReasonId(null);

    try {
      const result = await analyzeContent(text, apiKey);
      setCurrentResult(result);
      setCheckState('result');

      // Persist to history with 24h expiry tracking
      const updatedHistory = store.addHistoryItem(result);
      setHistory(updatedHistory);
    } catch (err: unknown) {
      if (err instanceof AnalysisError) {
        setErrorType(err.code);
        setErrorMessage(err.message);
      } else {
        setErrorType('generic');
        setErrorMessage(err instanceof Error ? err.message : 'Analysis failed.');
      }
      setCheckState('error');
    } finally {
      inFlightRef.current = false;
      setIsAnalyzing(false);
    }
  };

  const handleSelectFromHistory = (result: AnalysisResult) => {
    setCurrentResult(result);
    setInputText(result.text);
    setSelectedReasonId(null);
    setCheckState('result');
    setActiveTab('check');
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleResetCheck = () => {
    setInputText('');
    setCurrentResult(null);
    setSelectedReasonId(null);
    setCheckState('empty');
  };

  const handleReasonClick = (id: number) => {
    setSelectedReasonId((prev) => (prev === id ? null : id));
    const elem = document.getElementById(`reason-${id}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const hasApiKey = store.hasKey();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-start items-center sm:py-6 p-0 font-sans antialiased text-slate-900">
      {/* 
        Fixed 380px wide Chrome side-panel container.
        Modern, sleek Chrome extension side panel with high-contrast clarity.
      */}
      <div className="w-full max-w-[400px] h-screen sm:h-[840px] bg-white text-slate-900 border-x border-slate-200/90 sm:border sm:rounded-2xl shadow-xl shadow-slate-300/40 flex flex-col overflow-hidden relative">
        {/* Side Panel Header */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          historyCount={history.length}
        />

        {/* Scrollable Side-Panel Body */}
        <main
          className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-3.5 bg-slate-50/50"
          role="region"
          aria-label="Side panel content"
        >
          {activeTab === 'check' && (
            <>
              {/* First-Run Inline Tour */}
              {showTour && (
                <TourInline
                  onComplete={() => setShowTour(false)}
                  onApiKeySaved={() => {
                    // Refresh view
                  }}
                />
              )}

              {/* Error State */}
              {checkState === 'error' && (
                <div className="flex flex-col gap-2" aria-live="polite">
                  <ErrorInline
                    errorType={errorType}
                    errorMessage={errorMessage}
                    onRetry={() => handleStartAnalysis()}
                    onDismiss={() => setCheckState('empty')}
                    onOpenSettings={() => setActiveTab('settings')}
                  />
                  <EmptyState
                    inputText={inputText}
                    setInputText={setInputText}
                    onAnalyze={() => handleStartAnalysis()}
                    hasApiKey={hasApiKey}
                    onOpenSettings={() => setActiveTab('settings')}
                    isAnalyzing={isAnalyzing}
                  />
                </div>
              )}

              {/* Empty State */}
              {checkState === 'empty' && (
                <EmptyState
                  inputText={inputText}
                  setInputText={setInputText}
                  onAnalyze={() => handleStartAnalysis()}
                  hasApiKey={hasApiKey}
                  onOpenSettings={() => setActiveTab('settings')}
                  isAnalyzing={isAnalyzing}
                />
              )}

              {/* Analyzing State */}
              {checkState === 'analyzing' && (
                <div aria-live="polite">
                  <AnalyzingState
                    text={inputText}
                    onCancel={() => {
                      inFlightRef.current = false;
                      setIsAnalyzing(false);
                      setCheckState('empty');
                    }}
                  />
                </div>
              )}

              {/* Result State */}
              {checkState === 'result' && currentResult && (
                <div className="flex flex-col gap-3.5 animate-fadeIn">
                  {/* Verdict Block */}
                  <VerdictBlock
                    verdict={currentResult.verdict as VerdictType}
                    verdictLabel={currentResult.verdictLabel}
                    scamType={currentResult.scamType}
                    score={currentResult.score}
                  />

                  {/* What We Saw with highlights & superscripts */}
                  <WhatWeSaw
                    text={currentResult.text}
                    highlights={currentResult.highlights}
                    verdict={currentResult.verdict as VerdictType}
                    selectedReasonId={selectedReasonId}
                    onSelectReason={handleReasonClick}
                  />

                  {/* Why List */}
                  <WhyList
                    reasons={currentResult.reasons}
                    verdict={currentResult.verdict as VerdictType}
                    selectedReasonId={selectedReasonId}
                    onSelectReason={handleReasonClick}
                  />

                  {/* Detected Links (if any) */}
                  <LinksSection links={currentResult.links} />

                  {/* Do This Imperatives */}
                  <DoThisSection imperatives={currentResult.imperatives} />

                  {/* Footer Actions */}
                  <FooterActions
                    result={currentResult}
                    onReset={handleResetCheck}
                  />
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <HistoryTab
              history={history}
              onSelectResult={handleSelectFromHistory}
              onClearHistory={handleClearHistory}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              onApiKeyUpdated={() => {
                if (checkState === 'error' && errorType === 'bad_key') {
                  setCheckState('empty');
                }
              }}
              onReplayTour={() => {
                setShowTour(true);
                setActiveTab('check');
              }}
              onHistoryCleared={() => {
                setHistory([]);
              }}
              onAllDataCleared={() => {
                setHistory([]);
                setInputText('');
                setCurrentResult(null);
                setCheckState('empty');
                setShowTour(true);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
