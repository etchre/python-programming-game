import type { Test } from '../../../types/Test';

export const tests: Test[] = [
  { type: 'return', args: ['#'], expected: 'wall', name: 'Wall' },
  { type: 'return', args: ['.'], expected: 'path', name: 'Path' },
  { type: 'return', args: ['S'], expected: 'start', name: 'Start' },
  { type: 'return', args: ['E'], expected: 'end', name: 'End' },
  { type: 'return', args: ['?'], expected: 'unknown', name: 'Unknown', hidden: true },
];
