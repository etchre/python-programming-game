// auto-loader — do not modify this file
// customize level metadata in data.ts instead
import type { Level, PythonModule } from '../../../types';
import type { BaseScene } from '../../../phaser/BaseScene';
import type { Test } from '../../../types/Test';
import * as data from './data';

const starterModules = import.meta.glob('./*.py', { eager: true, query: '?raw', import: 'default' });
const sceneModules = import.meta.glob('./*.scene.ts', { eager: true, import: 'default' });
const goalsModules = import.meta.glob('./*.goals.ts', { eager: true });
const pythonModuleFiles = import.meta.glob('./*.module.py', { eager: true, query: '?raw', import: 'default' });

const starterCode = Object.entries(starterModules)
  .filter(([path]) => !path.endsWith('.module.py'))
  .map(([, code]) => code)[0] as string;
const phaserScene = Object.values(sceneModules)[0] as typeof BaseScene | undefined;
const goals = Object.values(goalsModules)[0] as { tests?: Test[]; tasks?: any[] } | undefined;

const pythonModules: PythonModule[] = Object.entries(pythonModuleFiles).map(([path, code]) => {
  const filename = path.split('/').pop()!;
  const name = filename.replace('.module.py', '');
  return { name, code: code as string };
});

const parts = new URL(import.meta.url).pathname.split('/');
const folderName = parts[parts.length - 2] ?? '';
const id = parseInt(folderName, 10);

export const level: Level = {
  id,
  name: data.name,
  description: data.description,
  ...goals,
  starterCode,
  ...(phaserScene && { phaserScene }),
  ...(pythonModules.length > 0 && { pythonModules }),
  ...('levelData' in data && { levelData: data.levelData }),
};
