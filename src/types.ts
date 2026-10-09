export type VerdictType = 'safe' | 'suspicious' | 'high_risk';

export interface Highlight {
  id: number;
  text: string;
}

export interface Reason {
  id: number;
  label: string;
  quote: string;
  explanation: string;
  severity: 'Critical' | 'High' | 'Moderate' | 'Low' | 'None';
}

export interface LinkAnalysis {
  url: string;
  issue: string;
  flag?: string;
}

export interface AnalysisResult {
  id: string;
  text: string;
  verdict: VerdictType;
  verdictLabel: string;
  score: number; // 0 - 100
  scamType: string;
  timestamp: string;
  createdAt: number; // UTC millisecond epoch for 24h expiry
  relativeTime: string;
  highlights: Highlight[];
  reasons: Reason[];
  links: LinkAnalysis[];
  imperatives: string[];
  summary: string;
}

export type TabType = 'check' | 'history' | 'settings';

export type CheckState = 'empty' | 'analyzing' | 'result' | 'error';

export type ErrorType =
  | 'bad_key'
  | 'rate_limited'
  | 'provider_busy'
  | 'network_failure'
  | 'text_too_long'
  | 'malformed_json'
  | 'generic';

