import type { Level } from '../../types';

const modules = import.meta.glob<{ level: Level }>('./*/level.ts', { eager: true });

export const functionLevels = Object.values(modules)
  .map(m => m.level)
  .sort((a, b) => a.id - b.id);
