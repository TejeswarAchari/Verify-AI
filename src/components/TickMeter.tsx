import React from 'react';
import { VerdictType } from '../types';

interface TickMeterProps {
  score: number;
  verdict: VerdictType;
}

export const TickMeter: React.FC<TickMeterProps> = ({ score, verdict }) => {
  // 20 segments representing 0-100 in steps of 5
  const totalTicks = 20;
  const activeTicksCount = Math.min(totalTicks, Math.max(0, Math.round((score / 100) * totalTicks)));

  // Risk color mapping with modern vibrant tones
  const getTickColor = (isActive: boolean) => {
    if (!isActive) return 'bg-slate-200/90';
    switch (verdict) {
      case 'safe':
        return 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]';
      case 'suspicious':
        return 'bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.4)]';
      case 'high_risk':
      default:
        return 'bg-rose-500 shadow-[0_0_4px_rgba(239,68,68,0.4)]';
    }
  };

  const getScoreTextColor = () => {
    switch (verdict) {
      case 'safe':
        return 'text-emerald-700';
      case 'suspicious':
        return 'text-amber-700';
      case 'high_risk':
      default:
        return 'text-rose-700';
    }
  };

  return (
    <div className="flex flex-col gap-1.5 pt-2.5">
      <div className="flex items-center justify-between text-[11px] font-sans">
        <span className="text-slate-500 font-medium">Risk Score Meter</span>
        <span className={`tabular-nums font-bold ${getScoreTextColor()}`}>
          {score}<span className="text-slate-400 font-normal">/100</span>
        </span>
      </div>

      {/* 20 discrete vertical tick segments */}
      <div
        className="flex items-center gap-[3px] w-full py-1"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Risk score ${score} out of 100`}
      >
        {Array.from({ length: totalTicks }).map((_, index) => {
          const isActive = index < activeTicksCount;
          return (
            <div
              key={index}
              className={`h-3 flex-1 rounded-sm transition-all duration-200 ${getTickColor(isActive)}`}
            />
          );
        })}
      </div>
    </div>
  );
};
