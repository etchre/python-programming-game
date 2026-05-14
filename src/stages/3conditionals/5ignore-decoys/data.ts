import { MazeScene, robotModule, robotSenseModule } from '../../../phaser/maze';
import type { Test } from '../../../types/Test';

const tests: Test[] = [
  {
    type: 'state',
    name: 'Ignore lower openings',
    expression: 'robot.at_goal()',
    levelData: {
      grid: [
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '#######.#######',
        '#S............#',
        '###.#.###.#G###',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
  },
  {
    type: 'state',
    name: 'Ignore lower openings again',
    expression: 'robot.at_goal()',
    levelData: {
      grid: [
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '##########G####',
        '#S............#',
        '####.###.###.##',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
      ],
    },
  },
];

export const id = 5;
export const name = 'Ignore Decoys';
export const description =
  'Some side openings are harmless dead ends. Do not leave the main hallway just because a nearby square is open. ' +
  'Check for the actual goal first with calls like `robot_sense.check_up("goal")` and `robot_sense.check_down("goal")`; otherwise keep moving right.';

export const scene = MazeScene;
export const sharedModules = [robotModule, robotSenseModule];
export const levelData = tests[0].levelData;
export { tests };
