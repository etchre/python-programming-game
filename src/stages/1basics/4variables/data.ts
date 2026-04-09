import type { Test } from '../../../types/Test';

export const id = 4;
export const name = 'Variables!';
export const description = 'Store and manipulate values with variables.';

export const steps: Record<number, { description: string; tests?: Test[] }> = {
  1: {
    description: 'Create variables x and y, set them to 3 and 7, then print their sum.',
    tests: [{ type: 'stdout', expected: '10' }],
  },
  2: {
    description: 'Swap the values of x and y without using a third variable, then print both.',
    tests: [{ type: 'stdout', expected: '7\n3' }],
  },
  3: {
    description: 'Use multiple assignment to set a, b, c to 1, 2, 3 in one line, then print their product.',
    tests: [{ type: 'stdout', expected: '6' }],
  },
};
