import { MazeScene, robotModule } from '../../../phaser/maze';
import type { Test } from '../../../types/Test';

export const id = 1;
export const name = 'Find the Goal';
export const description = 'Move the robot (white circle) onto the green goal square.';

export const scene = MazeScene;
export const sharedModules = [robotModule];

export const levelData = {
  grid: [
    'S....',
    '.....',
    '..#..',
    '.....',
    '....G',
  ],
};

export const tests: Test[] = [
  {
    type: 'state',
    name: 'Reach the goal',
    expression: 'robot.at_goal()',
  },
];
