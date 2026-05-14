import { MazeScene, robotModule } from '../../../phaser/maze';
import type { Test } from '../../../types/Test';

export const id = 1;
export const name = 'First Steps';
export const description =
  "Welcome to your first Python program! The line `import robot` loads the robot commands. " +
  "Each line of code runs in order, from top to bottom. Use `robot.move_right()` to step one square " +
  "right — call it a few times in a row to reach the green goal square.";

export const scene = MazeScene;
export const sharedModules = [robotModule];

export const levelData = {
  grid: ['S..G'],
};

export const tests: Test[] = [
  { type: 'state', name: 'Reach the goal', expression: 'robot.at_goal()' },
];
