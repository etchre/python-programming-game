import { MazeScene, robotModule } from '../../../phaser/maze';
import type { Test } from '../../../types/Test';

export const id = 3;
export const name = 'The Long Snake';
export const description =
  "Same snaking pattern, but now 8x8. Without loops you'd be typing 40-plus calls; with loops, just " +
  "a handful. Stack one `for` loop per straight segment of the path. The pattern alternates: " +
  "long horizontal run, two squares down, long horizontal run the other way, two down, and so on.";

export const scene = MazeScene;
export const sharedModules = [robotModule];

export const levelData = {
  grid: [
    'S.......',
    '#######.',
    '........',
    '.#######',
    '........',
    '#######.',
    '........',
    '.......G',
  ],
};

export const tests: Test[] = [
  { type: 'state', name: 'Reach the goal', expression: 'robot.at_goal()' },
];
