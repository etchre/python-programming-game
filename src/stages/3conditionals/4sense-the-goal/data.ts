import { MazeScene, robotModule, robotSenseModule } from '../../../phaser/maze';
import type { Test } from '../../../types/Test';

const tests: Test[] = [
  {
    type: 'state',
    name: 'Early side exit',
    expression: 'robot.at_goal()',
    levelData: {
      grid: [
        '###############',
        '#S............#',
        '#######G#######',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
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
    name: 'Late side exit',
    expression: 'robot.at_goal()',
    levelData: {
      grid: [
        '###############',
        '#S............#',
        '###########G###',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
        '###############',
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

export const id = 4;
export const name = 'Sense the Goal';
export const description =
  'Wall checks are not the only question the robot can ask. Pass `"goal"` to a sensing function, like `robot_sense.check_down("goal")`, ' +
  'to detect whether the green square is next to the robot. Move along the hallway, but leave it as soon as the goal is below you.';

export const scene = MazeScene;
export const sharedModules = [robotModule, robotSenseModule];
export const levelData = tests[0].levelData;
export { tests };
