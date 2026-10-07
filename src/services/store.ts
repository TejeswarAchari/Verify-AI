import { AnalysisResult } from '../types';

export interface ReportedPattern {
  textHash: string;
  scamType: string;
  verdict: string;
  timestamp: string;
}

export interface PendingCheckItem {
  text: string;
  pageUrl?: string;
  timestamp: number;
}

const STORAGE_KEYS = {
  API_KEY: 'verifi_gemini_api_key',
  HISTORY: 'verifi_history_v1',
  REPORTS: 'verifi_reported_patterns_v1',
  PENDING_CHECK: 'verifi_pending_check',
  TOUR_COMPLETED: 'verifi_tour_completed',
};

export const HISTORY_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_HISTORY_CAP = 100;

export function formatRelativeTime(createdAt: number): string {
  const diffMs = Math.max(0, Date.now() - createdAt);
  if (diffMs < 60000) return 'Just now';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return '1d ago';
}

class Store {
  private memApiKey: string = '';
  private memHistory: AnalysisResult[] = [];
  private memReports: ReportedPattern[] = [];
  private memTourCompleted: boolean = false;
  private serverKeyAvailable: boolean = false;
  private initialized: boolean = false;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.init();
  }

  private isChromeStorageLocalAvailable(): boolean {
    return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
  }

  private isChromeStorageSessionAvailable(): boolean {
    return typeof chrome !== 'undefined' && Boolean(chrome.storage?.session);
  }

  private async init(): Promise<void> {
    if (this.initialized) return;

    if (this.isChromeStorageLocalAvailable()) {
      try {
        const data = await chrome.storage.local.get([
          STORAGE_KEYS.API_KEY,
          STORAGE_KEYS.HISTORY,
          STORAGE_KEYS.REPORTS,
          STORAGE_KEYS.TOUR_COMPLETED,
        ]);

        if (typeof data[STORAGE_KEYS.API_KEY] === 'string') {
          this.memApiKey = data[STORAGE_KEYS.API_KEY] as string;
        }
        if (Array.isArray(data[STORAGE_KEYS.HISTORY])) {
          this.memHistory = data[STORAGE_KEYS.HISTORY] as AnalysisResult[];
        }
        if (Array.isArray(data[STORAGE_KEYS.REPORTS])) {
          this.memReports = data[STORAGE_KEYS.REPORTS] as ReportedPattern[];
        }
        if (typeof data[STORAGE_KEYS.TOUR_COMPLETED] === 'boolean') {
          this.memTourCompleted = data[STORAGE_KEYS.TOUR_COMPLETED] as boolean;
        }
      } catch {
        // Fall through
      }
    } else {
      // Preview environment fallback only
      try {
        const localKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
        if (localKey) this.memApiKey = localKey;

        const localHist = localStorage.getItem(STORAGE_KEYS.HISTORY);
        if (localHist) {
          const parsed = JSON.parse(localHist);
          if (Array.isArray(parsed)) this.memHistory = parsed;
        }

        const localReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
        if (localReports) {
          const parsed = JSON.parse(localReports);
          if (Array.isArray(parsed)) this.memReports = parsed;
        }

        const tour = localStorage.getItem(STORAGE_KEYS.TOUR_COMPLETED);
        if (tour !== null) {
          this.memTourCompleted = tour === 'true';
        }
      } catch {
        // Ignore preview fallback errors
      }
    }

    // Purge any expired items on init
    this.purgeExpiredHistoryInternal();

    // Check if server-side key is available in preview environment
    if (!this.isChromeStorageLocalAvailable() && typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const d = await res.json();
          if (d?.hasServerKey) this.serverKeyAvailable = true;
        }
      } catch {
        // Ignore
      }
    }

    this.initialized = true;
  }

  async ready(): Promise<void> {
    await this.initPromise;
  }

  hasKey(): boolean {
    return Boolean(this.memApiKey.trim() || this.serverKeyAvailable);
  }

  // --- API Key ---
  getApiKey(): string {
    return this.memApiKey;
  }

  async setApiKey(key: string): Promise<void> {
    const trimmed = key.trim();
    this.memApiKey = trimmed;

    if (this.isChromeStorageLocalAvailable()) {
      try {
        await chrome.storage.local.set({ [STORAGE_KEYS.API_KEY]: trimmed });
      } catch {
        // Ignore
      }
    } else {
      try {
        localStorage.setItem(STORAGE_KEYS.API_KEY, trimmed);
      } catch {
        // Ignore
      }
    }
  }

  // --- First-Run Tour ---
  getTourCompleted(): boolean {
    return this.memTourCompleted;
  }

  async setTourCompleted(completed: boolean): Promise<void> {
    this.memTourCompleted = completed;

    if (this.isChromeStorageLocalAvailable()) {
      try {
        await chrome.storage.local.set({ [STORAGE_KEYS.TOUR_COMPLETED]: completed });
      } catch {
        // Ignore
      }
    } else {
      try {
        localStorage.setItem(STORAGE_KEYS.TOUR_COMPLETED, completed ? 'true' : 'false');
      } catch {
        // Ignore
      }
    }
  }

  // --- History & 24h Expiry ---
  private purgeExpiredHistoryInternal(): boolean {
    const now = Date.now();
    const originalLen = this.memHistory.length;

    // Filter items within 24 hours (createdAt must exist and be within HISTORY_EXPIRY_MS)
    this.memHistory = this.memHistory
      .filter((item) => {
        const created = item.createdAt || new Date(item.timestamp).getTime() || 0;
        return now - created <= HISTORY_EXPIRY_MS;
      })
      .slice(0, MAX_HISTORY_CAP);

    const changed = this.memHistory.length !== originalLen;
    if (changed) {
      this.persistHistory(this.memHistory);
    }
    return changed;
  }

  purgeExpiredHistory(): boolean {
    return this.purgeExpiredHistoryInternal();
  }

  getHistory(): AnalysisResult[] {
    this.purgeExpiredHistoryInternal();
    // Refresh relative times on each read
    return this.memHistory.map((item) => ({
      ...item,
      relativeTime: formatRelativeTime(item.createdAt || new Date(item.timestamp).getTime()),
    }));
  }

  private persistHistory(items: AnalysisResult[]): void {
    if (this.isChromeStorageLocalAvailable()) {
      chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: items }).catch(() => {});
    } else {
      try {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(items));
      } catch {
        // Ignore
      }
    }
  }

  addHistoryItem(item: AnalysisResult): AnalysisResult[] {
    const now = Date.now();
    const entry: AnalysisResult = {
      ...item,
      createdAt: item.createdAt || now,
      relativeTime: 'Just now',
    };

    // Filter out duplicates and prepend
    const filtered = this.memHistory.filter(
      (h) => h.id !== entry.id && h.text !== entry.text
    );

    // Filter expired and apply 100-entry cap
    const updated = [entry, ...filtered]
      .filter((h) => now - (h.createdAt || 0) <= HISTORY_EXPIRY_MS)
      .slice(0, MAX_HISTORY_CAP);

    this.memHistory = updated;
    this.persistHistory(updated);
    return updated;
  }

  async clearHistory(): Promise<void> {
    this.memHistory = [];

    if (this.isChromeStorageLocalAvailable()) {
      try {
        await chrome.storage.local.remove(STORAGE_KEYS.HISTORY);
      } catch {
        // Ignore
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
      } catch {
        // Ignore
      }
    }
  }

  // --- Clear All Data ---
  async clearAllData(): Promise<void> {
    this.memApiKey = '';
    this.memHistory = [];
    this.memReports = [];
    this.memTourCompleted = false;

    if (this.isChromeStorageLocalAvailable()) {
      try {
        await chrome.storage.local.clear();
      } catch {
        // Ignore
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_KEYS.API_KEY);
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
        localStorage.removeItem(STORAGE_KEYS.REPORTS);
        localStorage.removeItem(STORAGE_KEYS.TOUR_COMPLETED);
      } catch {
        // Ignore
      }
    }
  }

  // --- Pattern Reporting (Hashes only, no raw text) ---
  getReportedPatterns(): ReportedPattern[] {
    return this.memReports;
  }

  async reportPattern(record: {
    text: string;
    scamType: string;
    verdict: string;
    timestamp: string;
  }): Promise<ReportedPattern> {
    const textHash = await this.hashText(record.text);
    const entry: ReportedPattern = {
      textHash,
      scamType: record.scamType,
      verdict: record.verdict,
      timestamp: record.timestamp,
    };

    const updated = [entry, ...this.memReports].slice(0, 500);
    this.memReports = updated;

    if (this.isChromeStorageLocalAvailable()) {
      try {
        await chrome.storage.local.set({ [STORAGE_KEYS.REPORTS]: updated });
      } catch {
        // Ignore
      }
    } else {
      try {
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
      } catch {
        // Ignore
      }
    }

    // TODO: When backend endpoint is available, send anonymous hash and telemetry:
    // await fetch('https://api.verifi.security/v1/telemetry/report', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry),
    // });

    return entry;
  }

  // --- Session Pending Check Items ---
  async getPendingCheck(): Promise<PendingCheckItem | null> {
    if (this.isChromeStorageSessionAvailable()) {
      try {
        const res = await chrome.storage.session.get(STORAGE_KEYS.PENDING_CHECK);
        if (res && res[STORAGE_KEYS.PENDING_CHECK]) {
          return res[STORAGE_KEYS.PENDING_CHECK] as PendingCheckItem;
        }
      } catch {
        // Ignore
      }
    } else {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEYS.PENDING_CHECK);
        if (raw) return JSON.parse(raw);
      } catch {
        // Ignore
      }
    }
    return null;
  }

  async clearPendingCheck(): Promise<void> {
    if (this.isChromeStorageSessionAvailable()) {
      try {
        await chrome.storage.session.remove(STORAGE_KEYS.PENDING_CHECK);
      } catch {
        // Ignore
      }
    } else {
      try {
        sessionStorage.removeItem(STORAGE_KEYS.PENDING_CHECK);
      } catch {
        // Ignore
      }
    }
  }

  subscribeToPendingCheck(callback: (item: PendingCheckItem) => void): () => void {
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      const listener = (
        changes: { [key: string]: chrome.storage.StorageChange },
        areaName: string
      ) => {
        if (areaName === 'session' && changes[STORAGE_KEYS.PENDING_CHECK]?.newValue) {
          callback(changes[STORAGE_KEYS.PENDING_CHECK].newValue as PendingCheckItem);
        }
      };

      chrome.storage.onChanged.addListener(listener);
      return () => {
        chrome.storage.onChanged.removeListener(listener);
      };
    } else {
      const handler = (e: Event) => {
        const customEvent = e as CustomEvent<PendingCheckItem>;
        if (customEvent.detail) {
          callback(customEvent.detail);
        }
      };
      window.addEventListener('verifi_pending_check', handler);
      return () => {
        window.removeEventListener('verifi_pending_check', handler);
      };
    }
  }

  private async hashText(text: string): Promise<string> {
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const msgUint8 = new TextEncoder().encode(text.trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
      }
    } catch {
      // Fallback
    }
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return 'h_' + (hash >>> 0).toString(16);
  }
}

export const store = new Store();
