import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Link2 } from 'lucide-react';
import { LinkAnalysis } from '../types';

interface LinksSectionProps {
  links: LinkAnalysis[];
}

export const LinksSection: React.FC<LinksSectionProps> = ({ links }) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  if (!links || links.length === 0) return null;

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedUrl(url);
    setTimeout(() => {
      setCopiedUrl(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] font-sans">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold uppercase tracking-wider text-[10.5px]">
          <Link2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Detected URL Destinations</span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          {links.length} destination{links.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {links.map((link, index) => {
          const isCopied = copiedUrl === link.url;
          return (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5 shadow-2xs"
            >
              {/* URL row with copy chip */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11.5px] text-slate-900 truncate select-text flex-1 font-medium">
                  {link.url}
                </span>

                {/* Copy chip flipping to "Copied" */}
                <button
                  type="button"
                  onClick={() => handleCopy(link.url)}
                  className={`h-6 px-2.5 text-[11px] font-sans font-medium rounded-lg border transition-all inline-flex items-center gap-1 shrink-0 cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-label={isCopied ? 'Link copied' : 'Copy link'}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Threat or domain notes */}
              {link.issue && (
                <div className="text-[11.5px] leading-relaxed text-rose-700 bg-rose-50/70 border border-rose-100 px-2 py-1 rounded-md font-sans">
                  {link.issue}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
