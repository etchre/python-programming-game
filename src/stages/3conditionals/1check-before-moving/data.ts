import { MazeScene, robotModule, robotSenseModule } from '../../../phaser/maze';
import type { Test } from '../../../types/Test';

const tests: Test[] = [
  {
    type: 'state',
    name: 'Choose the open path',
    expression: 'robot.at_goal()',
    levelData: {
      grid: [
        '#####',
        '#S.G#',
        '#...#',
        '#...#',
        '#####',
      ],
    },
  },
  {
    type: 'state',
    name: 'Step around the wall',
    expression: 'robot.at_goal()',
    levelData: {
      grid: [
        '#####',
        '#S#.#',
        '#..G#',
        '#...#',
        '#####',
      ],
    },
  },
];

export const id = 1;
export const name = 'Check Before Moving';
export const description =
  'The robot can now sense nearby walls. `robot_sense.check_right()` is `True` when the square to the right is blocked. ' +
  'Use an `if` statement to decide whether the robot should step down first, then finish the short path to the green square.';

export const scene = MazeScene;
export const sharedModules = [robotModule, robotSenseModule];
export const levelData = tests[0].levelData;
export { tests };
