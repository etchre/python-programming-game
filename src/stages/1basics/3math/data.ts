import type { Test } from '../../../types/Test';

export const id = 3;
export const name = 'Math!';
export const description = 'Use arithmetic to compute maze properties.';
export const testFn = 'maze_area';

export const steps: Record<number, { description: string; tests?: Test[]; testFn?: string }> = {
  1: {
    description: 'Write a function called maze_area that takes width and height and returns the total number of cells.',
  },
  2: {
    description: 'Now write a function called open_percent that takes total_cells and wall_count, and returns the percentage of open cells as a float.',
    testFn: 'open_percent',
    tests: [
      { type: 'return', args: [100, 30], expected: '70.0', name: '100 cells, 30 walls' },
      { type: 'return', args: [50, 0], expected: '100.0', name: '50 cells, 0 walls' },
      { type: 'return', args: [200, 200], expected: '0.0', name: 'All walls', hidden: true },
    ],
  },
};
