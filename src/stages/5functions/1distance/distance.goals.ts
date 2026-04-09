import type { Test } from '../../../types/Test';

export const tests: Test[] = [
  { type: 'return', args: [[0, 0], [3, 4]], expected: '7', name: 'Origin to (3,4)' },
  { type: 'return', args: [[1, 1], [1, 1]], expected: '0', name: 'Same position' },
  { type: 'return', args: [[5, 2], [1, 8]], expected: '10', name: '(5,2) to (1,8)' },
  { type: 'return', args: [[0, 0], [0, 0]], expected: '0', name: 'Both at origin', hidden: true },
];
