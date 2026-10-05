import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Release incident: a bare "assets/" in .vercelignore also excluded public/assets,
// so the first deploy shipped without its art (all atlas requests 404).
describe('Release: .vercelignore', () => {
  const lines = readFileSync('.vercelignore', 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  it('never excludes public/ or public/assets/', () => {
    for (const l of lines) {
      expect(l).not.toMatch(/^(public\/?|public\/assets\/?|assets\/?|\*\*\/assets\/?)$/);
    }
  });

  it('anchors the raw art pack exclusion to the project root', () => {
    expect(lines).toContain('/assets/');
  });

  it('keeps secrets out of the upload', () => {
    expect(lines).toContain('.env*');
  });
});
