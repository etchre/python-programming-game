import type { Test } from '../../../types/Test';

export const tests: Test[] = [
  { type: 'return', args: [0], expected: '1', name: 'factorial(0)' },
  { type: 'return', args: [1], expected: '1', name: 'factorial(1)' },
  { type: 'return', args: [5], expected: '120', name: 'factorial(5)' },
  { type: 'return', args: [10], expected: '3628800', name: 'factorial(10)', hidden: true },
];
