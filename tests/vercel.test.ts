import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Review REV-2 (Pino): ship X-Content-Type-Options: nosniff on every response; no CSP.
describe('Release: Vercel config', () => {
  const cfg = JSON.parse(readFileSync('vercel.json', 'utf8'));

  it('builds with the project script and serves dist/', () => {
    expect(cfg.buildCommand).toBe('npm run build');
    expect(cfg.outputDirectory).toBe('dist');
  });

  it('REV-2: sends X-Content-Type-Options: nosniff for all paths', () => {
    const rule = cfg.headers.find((h: { source: string }) => h.source === '/(.*)');
    expect(rule.headers).toContainEqual({ key: 'X-Content-Type-Options', value: 'nosniff' });
  });

  it('does not add a Content-Security-Policy (REV-2: nosniff only)', () => {
    const keys = cfg.headers.flatMap((h: { headers: { key: string }[] }) => h.headers.map((x) => x.key.toLowerCase()));
    expect(keys).not.toContain('content-security-policy');
  });
});
