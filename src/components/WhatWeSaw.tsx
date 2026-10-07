import React from 'react';
import { Highlight, VerdictType } from '../types';
import { FileText } from 'lucide-react';

interface WhatWeSawProps {
  text: string;
  highlights: Highlight[];
  verdict: VerdictType;
  selectedReasonId: number | null;
  onSelectReason: (id: number) => void;
}

export const WhatWeSaw: React.FC<WhatWeSawProps> = ({
  text,
  highlights,
  verdict,
  selectedReasonId,
  onSelectReason,
}) => {
  const getHighlightStyle = (isActive: boolean) => {
    if (isActive) {
      switch (verdict) {
        case 'safe':
          return 'bg-emerald-200 text-emerald-950 ring-2 ring-emerald-500 rounded px-1 font-semibold';
        case 'suspicious':
          return 'bg-amber-200 text-amber-950 ring-2 ring-amber-500 rounded px-1 font-semibold';
        case 'high_risk':
        default:
          return 'bg-rose-200 text-rose-950 ring-2 ring-rose-500 rounded px-1 font-semibold';
      }
    }
    switch (verdict) {
      case 'safe':
        return 'bg-emerald-100/80 text-emerald-900 border-b-2 border-emerald-500 hover:bg-emerald-200/90 rounded px-1';
      case 'suspicious':
        return 'bg-amber-100/80 text-amber-900 border-b-2 border-amber-500 hover:bg-amber-200/90 rounded px-1';
      case 'high_risk':
      default:
        return 'bg-rose-100/80 text-rose-900 border-b-2 border-rose-500 hover:bg-rose-200/90 rounded px-1';
    }
  };

  const getSupColor = () => {
    switch (verdict) {
      case 'safe':
        return 'text-emerald-700 bg-emerald-100';
      case 'suspicious':
        return 'text-amber-800 bg-amber-100';
      case 'high_risk':
      default:
        return 'text-rose-700 bg-rose-100';
    }
  };

  // Build segments from text and highlights
  const renderHighlightedContent = () => {
    if (!highlights || highlights.length === 0) {
      return <span>{text}</span>;
    }

    interface Match {
      start: number;
      end: number;
      highlight: Highlight;
    }

    const matches: Match[] = [];
    highlights.forEach((h) => {
      if (!h.text) return;
      const idx = text.indexOf(h.text);
      if (idx !== -1) {
        matches.push({
          start: idx,
          end: idx + h.text.length,
          highlight: h,
        });
      }
    });

    matches.sort((a, b) => a.start - b.start);

    const filteredMatches: Match[] = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        filteredMatches.push(m);
        lastEnd = m.end;
      }
    }

    if (filteredMatches.length === 0) {
      return <span>{text}</span>;
    }

    const elements: React.ReactNode[] = [];
    let currentIndex = 0;

    filteredMatches.forEach((m, i) => {
      if (m.start > currentIndex) {
        elements.push(
          <span key={`plain-${i}`}>
            {text.substring(currentIndex, m.start)}
          </span>
        );
      }

      const isSelected = selectedReasonId === m.highlight.id;

      elements.push(
        <mark
          key={`hl-${m.highlight.id}`}
          onClick={() => onSelectReason(m.highlight.id)}
          className={`cursor-pointer transition-all duration-150 inline-block my-0.5 mx-0.5 ${getHighlightStyle(
            isSelected
          )}`}
          title={`Click to view reason ${m.highlight.id}`}
        >
          {m.highlight.text}
          <sup className={`ml-1 px-1 py-0.2 rounded text-[9.5px] font-mono font-bold ${getSupColor()}`}>
            #{m.highlight.id}
          </sup>
        </mark>
      );

      currentIndex = m.end;
    });

    if (currentIndex < text.length) {
      elements.push(
        <span key="plain-tail">
          {text.substring(currentIndex)}
        </span>
      );
    }

    return elements;
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] font-sans">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold uppercase tracking-wider text-[10.5px]">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Extracted Message Content</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">raw input</span>
      </div>

      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 text-[12px] leading-relaxed font-mono text-slate-800 break-words whitespace-pre-wrap select-text shadow-2xs">
        {renderHighlightedContent()}
      </div>
      <p className="text-[10.5px] text-slate-500 font-sans pl-0.5">
        Tip: Click any highlighted phrase above to inspect its breakdown below.
      </p>
    </div>
  );
};
