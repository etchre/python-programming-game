import type { Test } from '../../../types/Test';

export const tests: Test[] = [
  { type: 'return', args: [[2, 3], 'N'], expected: '(1, 3)', name: 'Move north' },
  { type: 'return', args: [[2, 3], 'S'], expected: '(3, 3)', name: 'Move south' },
  { type: 'return', args: [[2, 3], 'E'], expected: '(2, 4)', name: 'Move east' },
  { type: 'return', args: [[0, 0], 'W'], expected: '(0, -1)', name: 'Move west from origin', hidden: true },
];
