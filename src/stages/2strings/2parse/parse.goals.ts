import type { Test } from '../../../types/Test';

export const tests: Test[] = [
  { type: 'return', args: ['move north 3'], expected: "('move', 'north', 3)", name: 'Basic command' },
  { type: 'return', args: ['  MOVE  North  3  '], expected: "('move', 'north', 3)", name: 'Extra whitespace + caps' },
  { type: 'return', args: ['turn east 1'], expected: "('turn', 'east', 1)", name: 'Turn east' },
  { type: 'return', args: ['JUMP south 10'], expected: "('jump', 'south', 10)", name: 'Uppercase', hidden: true },
];
