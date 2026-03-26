import { Test } from './Test';
import { BaseScene } from '../phaser/BaseScene';

export interface PythonModule {
  name: string;
  code: string;
}

export type StepDraftMode = 'independent' | 'inherit';

export interface Step {
  description: string;
  starterCode: string;
  tests?: Test[];
  tasks?: any[];
}

export interface Level {
  id: number;
  name: string;
  description: string;
  tests?: Test[];
  tasks?: any[];
  starterCode: string;
  phaserScene?: typeof BaseScene;
  needsCodeUpdate?: boolean;
  pythonModules?: PythonModule[];
  levelData?: Record<string, any>;
  steps?: Step[];
  stepDraftMode?: StepDraftMode;
}
