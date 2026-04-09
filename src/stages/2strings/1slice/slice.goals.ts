import type { Test } from '../../../types/Test';

export const tests: Test[] = [
  { type: 'return', args: ['R3C7'], expected: '(3, 7)', name: 'R3C7' },
  { type: 'return', args: ['R0C0'], expected: '(0, 0)', name: 'R0C0' },
  { type: 'return', args: ['R12C5'], expected: '(12, 5)', name: 'R12C5' },
  { type: 'return', args: ['R1C99'], expected: '(1, 99)', name: 'R1C99', hidden: true },
];
