import { MazeScene, robotModule, robotSenseModule } from '../../../phaser/maze';
import type { Test } from '../../../types/Test';

const tests: Test[] = [
  {
    type: 'state',
    name: 'Wide stair path',
    expression: 'robot.at_goal()',
    levelData: {
      grid: [
        '###############',
        '#S....#########',
        '#####.#########',
        '#####.#########',
        '#####......####',
        '##########.####',
        '##########.####',
        '##########.####',
        '##########....#',
        '#############.#',
        '#############.#',
        '#############.#',
        '#############.#',
        '#############G#',
        '###############',
      ],
    },
  },
  {
    type: 'state',
    name: 'Long first turn',
    expression: 'robot.at_goal()',
    levelData: {
      grid: [
        '###############',
        '#S.......######',
        '########.######',
        '########.....##',
        '############.##',
        '############.##',
        '############.##',
        '############..#',
        '#############.#',
        '#############.#',
        '#############.#',
        '#############.#',
        '#############.#',
        '#############G#',
        '###############',
      ],
    },
  },
];

export const id = 3;
export const name = 'Turn at Walls';
export const description =
  'This path bends several times, and each test changes where the bends happen. ' +
  'Combine loops with wall checks: walk right until blocked, walk down until blocked, then repeat that pattern.';

export const scene = MazeScene;
export const sharedModules = [robotModule, robotSenseModule];
export const levelData = tests[0].levelData;
export { tests };
