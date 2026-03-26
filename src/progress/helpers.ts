import type { ProgressState } from '../types';

export function createEmptyState(): ProgressState {
  return {
    version: 1,
    levels: {},
  };
}

export function levelKey(stageId: number, levelId: number): string {
  return `${stageId}:${levelId}`;
}
