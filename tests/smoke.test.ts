import { describe, expect, it } from 'vitest';
import { START_GOLD, START_LIVES } from '../src/config/balance';

// T-1 smoke test: the toolchain runs and the BR-1 starting values are wired up.
describe('T-1 scaffold', () => {
  it('BR-1: a run starts with 10 lives and 150 gold (BR-10 tuned in T-11, RD-5)', () => {
    expect(START_LIVES).toBe(10);
    expect(START_GOLD).toBe(150);
  });
});
