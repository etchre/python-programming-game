import robotSource from './robot.module.py?raw';
import type { PythonModule } from '../../types';

export { MazeScene } from './MazeScene';
export type { MazeData, MazeGrid } from './types';

export const robotModule: PythonModule = {
  name: 'robot',
  code: robotSource,
};
