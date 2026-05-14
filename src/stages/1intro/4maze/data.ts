import { MazeScene, robotModule } from '../../../phaser/maze';
import type { Test } from '../../../types/Test';

export const id = 4;
export const name = 'Winding Path';
export const description =
  "A bigger 6x6 maze with a twist or two. You can solve it using only the four movement functions " +
  "you've already learned — type each step out, one per line, in the order the robot should take them. " +
  "(In the next stage you'll learn loops, which will let you handle long sequences with much less typing.)";

export const scene = MazeScene;
export const sharedModules = [robotModule];

export const levelData = {
  grid: [
    'S.....',
    '.####.',
    '....#.',
    '####..',
    '.....#',
    '.....G',
  ],
};

export const tests: Test[] = [
  { type: 'state', name: 'Reach the goal', expression: 'robot.at_goal()' },
];
