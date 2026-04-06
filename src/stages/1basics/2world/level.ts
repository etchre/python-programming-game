// auto-loader — do not modify this file
// customize level metadata in data.ts instead
import * as data from './data';
import { createLevel } from '../../createLevel';

export const level = createLevel(data, {
  pyFiles: import.meta.glob('./*.py', { eager: true, query: '?raw', import: 'default' }),
  sceneFiles: import.meta.glob('./*.scene.ts', { eager: true, import: 'default' }),
  goalsFiles: import.meta.glob('./*.goals.ts', { eager: true }),
  moduleFiles: import.meta.glob('./*.module.py', { eager: true, query: '?raw', import: 'default' }),
});
