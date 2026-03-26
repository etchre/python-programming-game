export interface StepProgress {
  code?: string;
  completed: boolean;
}

export interface LevelProgress {
  code?: string;
  completed: boolean;
  steps?: Record<number, StepProgress>;
  updatedAt: string;
}

export interface ProgressState {
  version: 1;
  levels: Record<string, LevelProgress>;
}

export interface ProgressAdapter {
  load(): Promise<ProgressState>;
  save(state: ProgressState): Promise<void>;
  resetAll(): Promise<void>;
}
