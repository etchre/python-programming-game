import { Test } from './Test';
import { BaseScene } from '../phaser/BaseScene';

export interface PythonModule {
  name: string;
  code: string;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  tests?: Test[];
  tasks?: any[]; // TODO: replace with Task type when defined
  starterCode: string;
  phaserScene?: typeof BaseScene;
  needsCodeUpdate?: boolean;
  pythonModules?: PythonModule[];
  levelData?: Record<string, any>;
}
