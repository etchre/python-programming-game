import type { Level, PythonModule, Step, StepDraftMode } from '../types';
import type { BaseScene } from '../phaser/BaseScene';
import type { Test } from '../types/Test';

interface DataModule {
  name: string;
  description: string;
  levelData?: Record<string, any>;
  stepDraftMode?: StepDraftMode;
  steps?: Record<number, { description: string; tests?: Test[]; tasks?: any[] }>;
}

interface GlobResults {
  pyFiles: Record<string, unknown>;
  sceneFiles: Record<string, unknown>;
  goalsFiles: Record<string, unknown>;
  moduleFiles: Record<string, unknown>;
}

export function createLevel(data: DataModule, globs: GlobResults, importMetaUrl: string): Level {
  const { pyFiles, sceneFiles, goalsFiles, moduleFiles } = globs;

  // separate step files, module files, and regular starter code
  const stepFileRegex = /\.step(\d+)\.py$/;
  const stepEntries: { num: number; code: string }[] = [];
  let starterCode = '';

  for (const [path, code] of Object.entries(pyFiles)) {
    if (path.endsWith('.module.py')) continue;
    const stepMatch = path.match(stepFileRegex);
    if (stepMatch) {
      stepEntries.push({ num: parseInt(stepMatch[1], 10), code: code as string });
    } else {
      starterCode = code as string;
    }
  }

  stepEntries.sort((a, b) => a.num - b.num);

  // phaser scene and goals
  const phaserScene = Object.values(sceneFiles)[0] as typeof BaseScene | undefined;
  const goals = Object.values(goalsFiles)[0] as { tests?: Test[]; tasks?: any[] } | undefined;

  // python modules
  const pythonModules: PythonModule[] = Object.entries(moduleFiles).map(([path, code]) => {
    const filename = path.split('/').pop()!;
    const name = filename.replace('.module.py', '');
    return { name, code: code as string };
  });

  // extract id from folder name
  const parts = new URL(importMetaUrl).pathname.split('/');
  const folderName = parts[parts.length - 2] ?? '';
  const id = parseInt(folderName, 10);

  // build steps if step files and data.steps both exist
  let steps: Step[] | undefined;
  if (data.steps && stepEntries.length > 0) {
    steps = stepEntries.map(({ num, code }) => {
      const stepData = data.steps![num];
      return {
        description: stepData?.description ?? data.description,
        starterCode: code,
        // step-specific tests/tasks override level-wide goals
        tests: stepData?.tests ?? goals?.tests,
        tasks: stepData?.tasks ?? goals?.tasks,
      };
    });
    // default starterCode to step 1
    starterCode = steps[0].starterCode;
  }

  return {
    id,
    name: data.name,
    description: data.description,
    ...goals,
    starterCode,
    ...(phaserScene && { phaserScene, needsCodeUpdate: !steps }),
    ...(pythonModules.length > 0 && { pythonModules }),
    ...(data.levelData && { levelData: data.levelData }),
    ...(steps && { steps }),
    stepDraftMode: data.stepDraftMode ?? 'independent',
  };
}
