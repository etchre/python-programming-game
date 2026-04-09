import type { Test } from '../../../types/Test';

export const id = 2;
export const name = 'Grid';
export const description = 'Print grid coordinates using loops.';

export const steps: Record<number, { description: string; tests?: Test[] }> = {
  1: {
    description: 'Use a for loop to print the numbers 0 through 4, each on its own line.',
    tests: [{ type: 'stdout', expected: '0\n1\n2\n3\n4' }],
  },
  2: {
    description: 'Use nested for loops to print all coordinates of a 3x3 grid as (row, col), one per line.',
    tests: [{ type: 'stdout', expected: '(0, 0)\n(0, 1)\n(0, 2)\n(1, 0)\n(1, 1)\n(1, 2)\n(2, 0)\n(2, 1)\n(2, 2)' }],
  },
};
