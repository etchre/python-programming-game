import { describe, it, expect } from 'vitest';
import { createLevel } from './createLevel';

const emptyGlobs = {
  pyFiles: {} as Record<string, unknown>,
  sceneFiles: {} as Record<string, unknown>,
  goalsFiles: {} as Record<string, unknown>,
  moduleFiles: {} as Record<string, unknown>,
};

describe('createLevel', () => {
  it('builds a basic single-step level', () => {
    const level = createLevel(
      { id: 1, name: 'Test', description: 'A test level' },
      {
        ...emptyGlobs,
        pyFiles: { './test.py': 'print("hi")' },
        goalsFiles: {
          './test.goals.ts': {
            tests: [{ type: 'stdout' as const, expected: 'hi' }],
          },
        },
      },
    );

    expect(level.id).toBe(1);
    expect(level.name).toBe('Test');
    expect(level.starterCode).toBe('print("hi")');
    expect(level.tests).toHaveLength(1);
    expect(level.tests![0].type).toBe('stdout');
    expect(level.steps).toBeUndefined();
  });

  it('builds a multi-step level from step files and data.steps', () => {
    const level = createLevel(
      {
        id: 2,
        name: 'Steps',
        description: 'Multi-step',
        steps: {
          1: { description: 'Step one' },
          2: { description: 'Step two' },
        },
      },
      {
        ...emptyGlobs,
        pyFiles: {
          './x.step1.py': 'code1',
          './x.step2.py': 'code2',
        },
        goalsFiles: {
          './x.goals.ts': {
            tests: [{ type: 'stdout' as const, expected: 'out' }],
          },
        },
      },
    );

    expect(level.steps).toHaveLength(2);
    expect(level.steps![0].description).toBe('Step one');
    expect(level.steps![0].starterCode).toBe('code1');
    expect(level.steps![1].starterCode).toBe('code2');
    // steps inherit goals-file tests
    expect(level.steps![0].tests).toEqual([{ type: 'stdout', expected: 'out' }]);
  });

  it('step-specific tests override goals-file tests', () => {
    const stepTests = [{ type: 'stdout' as const, expected: 'step-specific' }];
    const level = createLevel(
      {
        id: 3,
        name: 'Override',
        description: 'test',
        steps: {
          1: { description: 'S1', tests: stepTests },
          2: { description: 'S2' },
        },
      },
      {
        ...emptyGlobs,
        pyFiles: {
          './x.step1.py': 'a',
          './x.step2.py': 'b',
        },
        goalsFiles: {
          './x.goals.ts': {
            tests: [{ type: 'stdout' as const, expected: 'fallback' }],
          },
        },
      },
    );

    expect(level.steps![0].tests).toEqual(stepTests);
    expect(level.steps![1].tests![0].expected).toBe('fallback');
  });

  it('propagates level-wide testFn', () => {
    const level = createLevel(
      { id: 4, name: 'Fn', description: 'test', testFn: 'my_func' },
      {
        ...emptyGlobs,
        pyFiles: { './x.py': 'def my_func(): pass' },
      },
    );

    expect(level.testFn).toBe('my_func');
  });

  it('propagates step-level testFn', () => {
    const level = createLevel(
      {
        id: 5,
        name: 'StepFn',
        description: 'test',
        testFn: 'level_fn',
        steps: {
          1: { description: 'S1' },
          2: { description: 'S2', testFn: 'step_fn' },
        },
      },
      {
        ...emptyGlobs,
        pyFiles: {
          './x.step1.py': 'a',
          './x.step2.py': 'b',
        },
      },
    );

    expect(level.testFn).toBe('level_fn');
    expect(level.steps![0].testFn).toBeUndefined();
    expect(level.steps![1].testFn).toBe('step_fn');
  });

  it('collects python modules from .module.py files', () => {
    const level = createLevel(
      { id: 6, name: 'Mods', description: 'test' },
      {
        ...emptyGlobs,
        pyFiles: { './x.py': 'import helper' },
        moduleFiles: { './helper.module.py': 'def help(): pass' },
      },
    );

    expect(level.pythonModules).toHaveLength(1);
    expect(level.pythonModules![0].name).toBe('helper');
    expect(level.pythonModules![0].code).toBe('def help(): pass');
  });

  it('ignores .module.py files when building starter code', () => {
    const level = createLevel(
      { id: 7, name: 'NoMod', description: 'test' },
      {
        ...emptyGlobs,
        pyFiles: {
          './main.py': 'real code',
          './helper.module.py': 'module code',
        },
      },
    );

    expect(level.starterCode).toBe('real code');
  });

  it('sets starterCode to step 1 for multi-step levels', () => {
    const level = createLevel(
      {
        id: 8,
        name: 'Start',
        description: 'test',
        steps: { 1: { description: 'First' }, 2: { description: 'Second' } },
      },
      {
        ...emptyGlobs,
        pyFiles: {
          './x.step1.py': 'step1code',
          './x.step2.py': 'step2code',
        },
      },
    );

    expect(level.starterCode).toBe('step1code');
  });

  it('defaults stepDraftMode to independent', () => {
    const level = createLevel(
      { id: 9, name: 'Draft', description: 'test' },
      { ...emptyGlobs, pyFiles: { './x.py': '' } },
    );

    expect(level.stepDraftMode).toBe('independent');
  });

  it('passes through levelData', () => {
    const level = createLevel(
      { id: 10, name: 'Data', description: 'test', levelData: { colors: { red: 0xff0000 } } },
      { ...emptyGlobs, pyFiles: { './x.py': '' } },
    );

    expect(level.levelData).toEqual({ colors: { red: 0xff0000 } });
  });
});
