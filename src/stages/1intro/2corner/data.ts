import { MazeScene, robotModule } from '../../../phaser/maze';
import type { Test } from '../../../types/Test';

export const id = 2;
export const name = 'Around the Wall';
export const description =
  "You have four movement functions: `robot.move_up()`, `robot.move_down()`, `robot.move_left()`, " +
  "and `robot.move_right()`. Each call moves the robot one square in that direction. A wall blocks " +
  "the straight path — chain a few moves together to route around it.";

export const scene = MazeScene;
export const sharedModules = [robotModule];

export const levelData = {
  grid: [
    'S..',
    '.#.',
    '..G',
  ],
};

export const tests: Test[] = [
  { type: 'state', name: 'Reach the goal', expression: 'robot.at_goal()' },
];
