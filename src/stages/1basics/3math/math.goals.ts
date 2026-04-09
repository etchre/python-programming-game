import type { Test } from '../../../types/Test';

export const tests: Test[] = [
  { type: 'return', args: [5, 5], expected: '25', name: '5x5 maze' },
  { type: 'return', args: [10, 3], expected: '30', name: '10x3 maze' },
  { type: 'return', args: [1, 1], expected: '1', name: '1x1 maze', hidden: true },
];
