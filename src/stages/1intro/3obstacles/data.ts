import { MazeScene, robotModule } from '../../../phaser/maze';
import type { Test } from '../../../types/Test';

export const id = 3;
export const name = 'Obstacles';
export const description =
  "More walls, but the idea is the same: each move function steps the robot one square, and each " +
  "line of code runs in order. Plan a path through the obstacles, then write the moves one per line. " +
  "If the robot bumps into a wall, that call does nothing — but try to plan a path that never bumps.";

export const scene = MazeScene;
export const sharedModules = [robotModule];

export const levelData = {
  grid: [
    'S..#.',
    '.#.#.',
    '.#...',
    '.####',
    '....G',
  ],
};

export const tests: Test[] = [
  { type: 'state', name: 'Reach the goal', expression: 'robot.at_goal()' },
];
