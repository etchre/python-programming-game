import robotSource from './robot.module.py?raw';
import robotSenseSource from './robot_sense.module.py?raw';
import type { PythonModule } from '../../types';

export { MazeScene } from './MazeScene';
export type { MazeData, MazeGrid } from './types';

export const robotModule: PythonModule = {
  name: 'robot',
  code: robotSource,
};

// NOTE: robot_sense does `import robot` at module-load time, so any level using
// both must list robotModule BEFORE robotSenseModule in `sharedModules`.
// createLevel preserves array order — reversing the list silently breaks loading.
export const robotSenseModule: PythonModule = {
  name: 'robot_sense',
  code: robotSenseSource,
};
