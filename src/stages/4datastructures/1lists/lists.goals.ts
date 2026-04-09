import type { Test } from '../../../types/Test';

export const tests: Test[] = [
  { type: 'return', args: [[1, 2, 3, 2, 1]], expected: '[1, 2, 3]', name: 'Integers' },
  { type: 'return', args: [['a', 'b', 'a', 'c']], expected: "['a', 'b', 'c']", name: 'Strings' },
  { type: 'return', args: [[1, 1, 1]], expected: '[1]', name: 'All same' },
  { type: 'return', args: [[]], expected: '[]', name: 'Empty list', hidden: true },
];
