import { MazeScene, robotModule, robotSenseModule } from '../../../phaser/maze';
import type { Test } from '../../../types/Test';

const tests: Test[] = [
  {
    type: 'state',
    name: 'Short first hallway',
    expression: 'robot.at_goal()',
    levelData: {
      grid: [
        '##########',
        '#S....#..#',
        '#####.####',
        '#####.####',
        '#####.####',
        '#####...G#',
        '##########',
        '##########',
        '##########',
        '##########',
      ],
    },
  },
  {
    type: 'state',
    name: 'Long first hallway',
    expression: 'robot.at_goal()',
    levelData: {
      grid: [
        '##########',
        '#S......##',
        '#######.##',
        '#######.##',
        '#######.G#',
        '##########',
        '##########',
        '##########',
        '##########',
        '##########',
      ],
    },
  },
];

export const id = 2;
export const name = 'Walk Until Blocked';
export const description =
  'Different test mazes use different hallway lengths, so counting exact steps is fragile. ' +
  'Use `while not robot_sense.check_right():` to keep moving until the wall tells you to stop, then do the same after turning downward.';

export const scene = MazeScene;
export const sharedModules = [robotModule, robotSenseModule];
export const levelData = tests[0].levelData;
export { tests };
