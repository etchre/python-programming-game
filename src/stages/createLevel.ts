import type { Level, PythonModule, Step, StepDraftMode } from '../types';
import type { BaseScene } from '../phaser/BaseScene';
import type { Test } from '../types/Test';

interface DataModule {
  id: number;
  name: string;
  description: string;
  levelData?: Record<string, any>;
  testFn?: string;
  stepDraftMode?: StepDraftMode;
  steps?: Record<number, { description: string; tests?: Test[]; tasks?: any[]; testFn?: string }>;
  // Explicit scene class — preferred over a *.scene.ts file in the level dir.
  // Lets multiple levels share a single reusable scene (e.g. MazeScene).
  scene?: typeof BaseScene;
  // Python modules sourced from outside the level dir (e.g. src/phaser/maze/).
  // Merged with any local *.module.py files.
  sharedModules?: PythonModule[];
  // Level-wide tests inline in data.ts. Falls back to a *.goals.ts file.
  tests?: Test[];
}

interface GlobResults {
  pyFiles: Record<string, unknown>;
  sceneFiles: Record<string, unknown>;
  goalsFiles: Record<string, unknown>;
  moduleFiles: Record<string, unknown>;
}

export function createLevel(data: DataModule, globs: GlobResults): Level {
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

  // phaser scene — explicit data.scene wins, else fall back to globbed file
  const phaserScene = data.scene ?? (Object.values(sceneFiles)[0] as typeof BaseScene | undefined);

  // tests — explicit data.tests wins, else fall back to globbed goals file
  const goals = Object.values(goalsFiles)[0] as { tests?: Test[]; tasks?: any[] } | undefined;
  const levelTests = data.tests ?? goals?.tests;
  const levelTasks = goals?.tasks;

  // python modules — local *.module.py files plus any shared modules
  const localModules: PythonModule[] = Object.entries(moduleFiles).map(([path, code]) => {
    const filename = path.split('/').pop()!;
    const name = filename.replace('.module.py', '');
    return { name, code: code as string };
  });
  const pythonModules: PythonModule[] = [...(data.sharedModules ?? []), ...localModules];

  // build steps if step files and data.steps both exist
  let steps: Step[] | undefined;
  if (data.steps && stepEntries.length > 0) {
    steps = stepEntries.map(({ num, code }) => {
      const stepData = data.steps![num];
      return {
        description: stepData?.description ?? data.description,
        starterCode: code,
        // step-specific tests/tasks override level-wide goals
        tests: stepData?.tests ?? levelTests,
        tasks: stepData?.tasks ?? levelTasks,
        ...(stepData?.testFn && { testFn: stepData.testFn }),
      };
    });
    // default starterCode to step 1
    starterCode = steps[0].starterCode;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    ...(levelTests && { tests: levelTests }),
    ...(levelTasks && { tasks: levelTasks }),
    starterCode,
    ...(data.testFn && { testFn: data.testFn }),
    ...(phaserScene && { phaserScene, needsCodeUpdate: !steps }),
    ...(pythonModules.length > 0 && { pythonModules }),
    ...(data.levelData && { levelData: data.levelData }),
    ...(steps && { steps }),
    stepDraftMode: data.stepDraftMode ?? 'independent',
  };
}
