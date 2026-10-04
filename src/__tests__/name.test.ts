import { expect, test } from 'vitest';

import { KEYFRAMES } from '../index.js';

test('the package barrel exports the tool name', () => {
  expect(KEYFRAMES).toBe('keyframes');
});
