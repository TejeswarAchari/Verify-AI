import React from 'react';
import { TabType } from '../types';
import { CheckCheck, Clock, Settings2 } from 'lucide-react';
import { getShortcutLabel } from '../utils/shortcut';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  historyCount,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white shrink-0 sticky top-0 z-30">
      {/* Extension Header Bar */}
      <div className="px-3.5 pt-3 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 select-none">
          {/* Logo Mark: Clean verification badge */}
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <CheckCheck className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          </div>

          {/* Unified Brand Name: Verify AI together */}
          <h1 className="font-bold text-[15px] tracking-tight text-slate-900 font-sans">
            Verify AI
          </h1>
        </div>

        {/* Extension shortcut hint */}
        <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-slate-500">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/80 text-slate-600 font-medium">
            {getShortcutLabel()}
          </kbd>
        </div>
      </div>

      {/* Segmented Tab Control */}
      <div className="px-3 pb-2.5">
        <nav
          className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80"
          role="tablist"
          aria-label="Extension navigation"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'check'}
            onClick={() => onTabChange('check')}
            className={`flex-1 py-1.5 px-2 text-[12px] font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'check'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <CheckCheck className={`w-3.5 h-3.5 ${activeTab === 'check' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Check</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'history'}
            onClick={() => onTabChange('history')}
            className={`flex-1 py-1.5 px-2 text-[12px] font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>History</span>
            {historyCount > 0 && (
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === 'history' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {historyCount}
              </span>
            )}
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'settings'}
            onClick={() => onTabChange('settings')}
            className={`flex-1 py-1.5 px-2 text-[12px] font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Settings2 className={`w-3.5 h-3.5 ${activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
