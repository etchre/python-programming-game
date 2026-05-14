import { MazeScene, robotModule } from '../../../phaser/maze';
import type { Test } from '../../../types/Test';

export const id = 2;
export const name = 'Snake Path';
export const description =
  "A path that snakes back and forth through a 5x5 grid. You'll need several `for` loops — one for " +
  "each straight segment. You can stack loops one after another: " +
  "`for _ in range(4): robot.move_right()` followed by `for _ in range(2): robot.move_down()` " +
  "chains two segments together. Underscore (`_`) is a common Python convention for a loop variable you don't use.";

export const scene = MazeScene;
export const sharedModules = [robotModule];

export const levelData = {
  grid: [
    'S....',
    '####.',
    '.....',
    '.####',
    '....G',
  ],
};

export const tests: Test[] = [
  { type: 'state', name: 'Reach the goal', expression: 'robot.at_goal()' },
];
