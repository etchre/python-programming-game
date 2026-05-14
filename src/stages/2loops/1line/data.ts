import { MazeScene, robotModule } from '../../../phaser/maze';
import type { Test } from '../../../types/Test';

const line = (n: number) => 'S' + '.'.repeat(n - 2) + 'G';

export const id = 1;
export const name = 'Loop the Line';
export const description =
  "Meet the `for` loop. A `for` loop repeats indented code a set number of times. The syntax is: " +
  "`for i in range(N):` followed by an indented line — that indented line then runs N times. " +
  "This level runs your code against 5 line lengths (4, 8, 10, 20, then 50 squares wide). Typing " +
  "`robot.move_right()` 49 times for the 50-wide line would be ridiculous — write one loop instead. " +
  "Tip: the robot bumps harmlessly when it hits the edge of the grid, so a single generous loop count " +
  "(like `range(49)`) works for every test, even the short ones.";

export const scene = MazeScene;
export const sharedModules = [robotModule];

export const tests: Test[] = [
  { type: 'state', name: '4 wide', expression: 'robot.at_goal()', levelData: { grid: [line(4)] } },
  { type: 'state', name: '8 wide', expression: 'robot.at_goal()', levelData: { grid: [line(8)] } },
  { type: 'state', name: '10 wide', expression: 'robot.at_goal()', levelData: { grid: [line(10)] } },
  { type: 'state', name: '20 wide', expression: 'robot.at_goal()', levelData: { grid: [line(20)] } },
  { type: 'state', name: '50 wide', expression: 'robot.at_goal()', levelData: { grid: [line(50)] } },
];
