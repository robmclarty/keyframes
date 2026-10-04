import { expect, test } from 'vitest';

import { KEYFRAMES } from './index.js';

test('keyframes smoke', () => {
  expect(KEYFRAMES).toBe('keyframes');
});
