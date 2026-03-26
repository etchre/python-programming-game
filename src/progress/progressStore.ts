import { LocalProgressAdapter } from './adapters/localProgressAdapter';
import { createEmptyState, levelKey } from './helpers';
import type { LevelProgress, ProgressAdapter, ProgressState, StepProgress } from '../types';

const adapter: ProgressAdapter = new LocalProgressAdapter();

function createEmptyLevelProgress(): LevelProgress {
  return {
    completed: false,
    updatedAt: new Date().toISOString(),
  };
}

async function updateLevelProgress(
  stageId: number,
  levelId: number,
  updater: (current: LevelProgress) => LevelProgress | null,
): Promise<ProgressState> {
  const state = await adapter.load();
  const key = levelKey(stageId, levelId);
  const current = state.levels[key] ?? createEmptyLevelProgress();
  const next = updater(current);

  if (next == null) {
    delete state.levels[key];
  } else {
    state.levels[key] = {
      ...next,
      updatedAt: new Date().toISOString(),
    };
  }

  await adapter.save(state);
  return state;
}

function upsertStep(current: LevelProgress, stepIndex: number, updater: (step: StepProgress) => StepProgress): LevelProgress {
  const steps = current.steps ?? {};
  const step = steps[stepIndex] ?? { completed: false };

  return {
    ...current,
    steps: {
      ...steps,
      [stepIndex]: updater(step),
    },
  };
}

export async function getProgressState(): Promise<ProgressState> {
  return adapter.load();
}

export async function getLevelProgress(stageId: number, levelId: number): Promise<LevelProgress | null> {
  const state = await adapter.load();
  return state.levels[levelKey(stageId, levelId)] ?? null;
}

export async function saveLevelCode(stageId: number, levelId: number, code: string): Promise<void> {
  await updateLevelProgress(stageId, levelId, (current) => ({
    ...current,
    code,
  }));
}

export async function saveStepCode(stageId: number, levelId: number, stepIndex: number, code: string): Promise<void> {
  await updateLevelProgress(stageId, levelId, (current) =>
    upsertStep(current, stepIndex, (step) => ({
      ...step,
      code,
    })),
  );
}

export async function markLevelCompleted(stageId: number, levelId: number, completed = true): Promise<void> {
  await updateLevelProgress(stageId, levelId, (current) => ({
    ...current,
    completed,
  }));
}

export async function markStepCompleted(
  stageId: number,
  levelId: number,
  stepIndex: number,
  completed = true,
): Promise<void> {
  await updateLevelProgress(stageId, levelId, (current) =>
    upsertStep(current, stepIndex, (step) => ({
      ...step,
      completed,
    })),
  );
}

export async function resetLevelProgress(stageId: number, levelId: number): Promise<void> {
  await updateLevelProgress(stageId, levelId, () => null);
}

export async function resetAllProgress(): Promise<void> {
  await adapter.resetAll();
}

export { createEmptyState } from './helpers';
