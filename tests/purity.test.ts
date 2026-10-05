import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// ADR-002: the simulation (and its config) never depends on Phaser or the DOM.
describe('ADR-002 purity', () => {
  for (const dir of ['src/sim', 'src/config']) {
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
      it(`${dir}/${file} does not import Phaser`, () => {
        const src = readFileSync(`${dir}/${file}`, 'utf8');
        expect(src).not.toMatch(/from ['"]phaser['"]/);
        expect(src).not.toMatch(/\bwindow\.|\bdocument\./);
      });
    }
  }
});
