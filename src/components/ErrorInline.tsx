import React from 'react';
import { ErrorType } from '../types';
import { AlertCircle, RefreshCw, Settings, X } from 'lucide-react';

interface ErrorInlineProps {
  errorType: ErrorType;
  errorMessage?: string;
  onRetry: () => void;
  onDismiss: () => void;
  onOpenSettings?: () => void;
}

export const ErrorInline: React.FC<ErrorInlineProps> = ({
  errorType,
  errorMessage,
  onRetry,
  onDismiss,
  onOpenSettings,
}) => {
  const getErrorDetails = () => {
    switch (errorType) {
      case 'bad_key':
        return {
          title: 'Authentication Required (401)',
          description:
            errorMessage ||
            'Gemini API key is invalid or unauthorized. Open Settings to set or update your key.',
          showSettingsLink: true,
        };
      case 'rate_limited':
        return {
          title: 'Quota Exceeded (429)',
          description:
            errorMessage ||
            'Request rate limit temporarily reached. Please wait a few seconds before retrying.',
          showSettingsLink: false,
        };
      case 'provider_busy':
        return {
          title: 'Gemini Temporarily Busy (503)',
          description:
            errorMessage || 'Gemini is temporarily at capacity. Wait a moment, then retry.',
          showSettingsLink: false,
        };
      case 'text_too_long':
        return {
          title: 'Text Limit Exceeded',
          description:
            errorMessage ||
            'Submitted text exceeds the 6,000 character analysis window. Shorten the text selection.',
          showSettingsLink: false,
        };
      case 'malformed_json':
        return {
          title: 'Model Response Error',
          description:
            errorMessage ||
            'Structured output validation failed after retry. Please try analyzing again.',
          showSettingsLink: false,
        };
      case 'network_failure':
      default:
        return {
          title: 'Connection Timeout',
          description:
            errorMessage ||
            'Connection timed out while contacting Gemini API. Check your internet connectivity.',
          showSettingsLink: false,
        };
    }
  };

  const details = getErrorDetails();

  return (
    <div className="bg-rose-50/90 border border-rose-200 rounded-xl p-3.5 my-1 flex flex-col gap-2.5 shadow-xs animate-fadeIn font-sans">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-bold text-[13px] text-rose-900">
            {details.title}
          </span>
          <p className="text-[12px] leading-relaxed text-rose-800">
            {details.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-rose-200/60">
        <button
          type="button"
          onClick={onRetry}
          className="h-7 px-3 text-[11.5px] font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry analysis</span>
        </button>

        {details.showSettingsLink && onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="h-7 px-2.5 text-[11.5px] font-semibold text-rose-900 bg-white hover:bg-rose-100/70 border border-rose-200 rounded-lg inline-flex items-center gap-1 transition-all cursor-pointer"
          >
            <Settings className="w-3 h-3" />
            <span>Open Settings</span>
          </button>
        )}

        <button
          type="button"
          onClick={onDismiss}
          className="h-7 px-2 text-[11.5px] font-medium text-rose-700 hover:text-rose-900 transition-colors cursor-pointer ml-auto"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
