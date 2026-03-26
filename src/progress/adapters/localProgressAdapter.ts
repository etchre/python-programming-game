import type { ProgressAdapter, ProgressState } from '../../types';
import { createEmptyState } from '../helpers';

const STORAGE_KEY = 'micromouse.progress.v1';

export class LocalProgressAdapter implements ProgressAdapter {
  async load(): Promise<ProgressState> {
    if (typeof window === 'undefined') {
      return createEmptyState();
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createEmptyState();
    }

    try {
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      if (parsed.version !== 1 || typeof parsed.levels !== 'object' || parsed.levels == null) {
        return createEmptyState();
      }

      return {
        version: 1,
        levels: parsed.levels as ProgressState['levels'],
      };
    } catch {
      return createEmptyState();
    }
  }

  async save(state: ProgressState): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  async resetAll(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }
}
