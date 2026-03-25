// this file is auto set up to parse the correct files for this level
// given the folder structure is set up correctly
// be careful when modifying these values
import type { Level } from '../../../types';
import type { BaseScene } from '../../../phaser/BaseScene';
import type { Test } from '../../../types/Test';

// these will automatically grab the starter code, tests & tasks
// and the respective phaser scene for this level
// starter code -> any .py file
// test & tasks -> any .goals.ts file
// phaser scene -> any .scene.ts file
const starterModules = import.meta.glob('./*.py', { eager: true, query: '?raw', import: 'default' });
const sceneModules = import.meta.glob('./*.scene.ts', { eager: true, import: 'default' });
const goalsModules = import.meta.glob('./*.goals.ts', { eager: true });

const starterCode = Object.values(starterModules)[0] as string;
const phaserScene = Object.values(sceneModules)[0] as typeof BaseScene | undefined;
const goals = Object.values(goalsModules)[0] as { tests?: Test[]; tasks?: any[] } | undefined;

// the id of the level is infered by the folder name
// 1hello -> 1, therefore the id for this level is 1
const parts = new URL(import.meta.url).pathname.split('/');
const folderName = parts[parts.length - 2] ?? '';
const id = parseInt(folderName, 10);

// only modify the name and description
export const level: Level = {
  id,
  name: 'Hello!',
  description: 'hello from the console!',
  ...goals,
  starterCode,
  ...(phaserScene && { phaserScene, needsCodeUpdate: true }),
};
