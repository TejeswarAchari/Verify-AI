import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface DoThisSectionProps {
  imperatives: string[];
}

export const DoThisSection: React.FC<DoThisSectionProps> = ({ imperatives }) => {
  if (!imperatives || imperatives.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] font-sans">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold uppercase tracking-wider text-[10.5px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Recommended Next Actions</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">guidelines</span>
      </div>

      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
        <ul className="flex flex-col gap-2.5">
          {imperatives.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 text-[12px] leading-relaxed text-slate-800 font-sans"
            >
              <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-mono text-[10.5px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </div>
              <span className="font-medium text-slate-800">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
