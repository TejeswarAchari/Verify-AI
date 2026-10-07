export interface LocalUrlFinding {
  url: string;
  domain: string;
  issues: string[];
}

const COMMON_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'is.gd',
  'cutt.ly',
  'ow.ly',
  'rb.gy',
  'shorturl.at',
  'rebrand.ly',
  'qr.ae',
  'v.gd',
  'buff.ly',
  'soo.gd',
]);

const SUSPICIOUS_TLDS = new Set([
  'top',
  'xyz',
  'info',
  'click',
  'live',
  'online',
  'vip',
  'icu',
  'tk',
  'ml',
  'ga',
  'cf',
  'gq',
  'club',
  'rest',
  'fit',
  'cam',
  'bid',
]);

/**
 * Extracts all URLs from text and applies local heuristic checks:
 * - Punycode (xn--)
 * - Direct IP-address hosts
 * - URL shorteners hiding destination
 * - Mixed-script / Cyrillic homoglyph lookalikes
 * - High-risk phishing TLDs
 */
export function inspectUrlsInText(text: string): LocalUrlFinding[] {
  // Regex matching http/https URLs and bare domains with paths or common TLDs
  const urlRegex =
    /\bhttps?:\/\/[^\s<>"]+|\bwww\.[^\s<>"]+|\b[a-zA-Z0-9][-a-zA-Z0-9]*\.(?:com|net|org|top|xyz|info|co|io|app|online|site|live|click|co\.uk|gov|edu)[^\s<>"]*/gi;

  const matches = text.match(urlRegex) || [];
  const findings: LocalUrlFinding[] = [];
  const seen = new Set<string>();

  for (const rawUrl of matches) {
    const cleanUrl = rawUrl.replace(/[.,;!?)]+$/, ''); // Strip trailing punctuation
    if (seen.has(cleanUrl)) continue;
    seen.add(cleanUrl);

    try {
      // Normalize protocol for URL parsing
      const fullUrl = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')
        ? cleanUrl
        : `https://${cleanUrl}`;

      const parsed = new URL(fullUrl);
      const hostname = parsed.hostname.toLowerCase();
      const issues: string[] = [];

      // 1. IP-address host
      const isIpv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
      const isIpv6 = hostname.includes(':');
      if (isIpv4 || isIpv6) {
        issues.push(`Direct IP address host (${hostname}) rather than a registered domain name.`);
      }

      // 2. Punycode check
      if (hostname.includes('xn--') || cleanUrl.includes('xn--')) {
        issues.push(`Punycode domain detected (${hostname}); may disguise lookalike characters.`);
      }

      // 3. Mixed-script / Homoglyphs (e.g. Cyrillic letters looking like Latin: а, е, о, р, с, у, х)
      const hasCyrillic = /[\u0400-\u04FF]/.test(hostname);
      const hasLatin = /[a-z]/.test(hostname);
      if (hasCyrillic && hasLatin) {
        issues.push(`Mixed-script homoglyphs detected in hostname (Cyrillic combined with Latin characters).`);
      }

      // 4. URL shortener
      if (COMMON_SHORTENERS.has(hostname)) {
        issues.push(`URL shortener (${hostname}) obfuscates true destination.`);
      }

      // 5. High-risk TLD
      const parts = hostname.split('.');
      const tld = parts[parts.length - 1];
      if (SUSPICIOUS_TLDS.has(tld)) {
        issues.push(`Atypical top-level domain (.${tld}) frequently used in transient phishing infrastructure.`);
      }

      // 6. Excessive subdomains or hyphens (often used to fake brand names e.g. bank.com.update-security.xyz)
      if (parts.length > 3) {
        issues.push(`Excessive subdomains (${parts.length} levels); inspect root domain carefully.`);
      }
      if ((hostname.match(/-/g) || []).length >= 3) {
        issues.push(`High hyphen count in domain name, common in brand spoofing.`);
      }

      findings.push({
        url: cleanUrl,
        domain: hostname,
        issues,
      });
    } catch {
      // Skip invalid URLs
    }
  }

  return findings;
}
