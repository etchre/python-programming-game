import type { Test } from '../../../types/Test';

export const id = 2;
export const name = 'Factorial';
export const description = 'Compute factorial iteratively, then recursively.';
export const testFn = 'factorial';

export const steps: Record<number, { description: string; tests?: Test[] }> = {
  1: {
    description: 'Write an iterative factorial function using a for loop.',
  },
  2: {
    description: 'Now rewrite factorial using recursion. Remember: base case first!',
  },
};
