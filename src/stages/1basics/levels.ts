import type { Level } from '../../types';

const modules = import.meta.glob<{ level: Level }>('./*/level.ts', { eager: true });

// modify this name as needed
export const basicLevels = Object.values(modules)
  .map(m => m.level)
  .sort((a, b) => a.id - b.id);
