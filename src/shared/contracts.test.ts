import { describe, expect, it } from 'vitest';
import type { AppResult } from './contracts';

describe('AppResult contract', () => {
  it('represents a successful value', () => {
    const result: AppResult<number> = { ok: true, value: 42 };
    expect(result.ok).toBe(true);
  });

  it('represents a typed failure', () => {
    const result: AppResult<number> = { ok: false, error: { code: 'TEST', message: 'Expected failure' } };
    expect(result.ok).toBe(false);
  });
});
