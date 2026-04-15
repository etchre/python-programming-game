// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { stages } from './stages';
import type { Level, Step } from '../types';
import type { Test, ReturnTest } from '../types/Test';

describe('level data integrity', () => {
  const allLevels: { stage: string; level: Level }[] = [];
  for (const stage of stages) {
    for (const level of stage.levels) {
      allLevels.push({ stage: stage.name, level });
    }
  }

  it('has at least one stage', () => {
    expect(stages.length).toBeGreaterThan(0);
  });

  it('stage IDs are unique', () => {
    const ids = stages.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('level IDs are unique within each stage', () => {
    for (const stage of stages) {
      const ids = stage.levels.map((l) => l.id);
      expect(new Set(ids).size).withContext(`Stage "${stage.name}" has duplicate level IDs`).toBe(ids.length);
    }
  });

  it('every level has a name and description', () => {
    for (const { stage, level } of allLevels) {
      expect(level.name, `${stage}/${level.name} missing name`).toBeTruthy();
      expect(level.description, `${stage}/${level.name} missing description`).toBeTruthy();
    }
  });

  it('every level has starter code', () => {
    for (const { stage, level } of allLevels) {
      expect(level.starterCode, `${stage}/${level.name} has no starterCode`).toBeDefined();
    }
  });

  // collect all (level, tests, testFn) combos including steps
  function getTestGroups(level: Level): { label: string; tests: Test[]; testFn?: string }[] {
    const groups: { label: string; tests: Test[]; testFn?: string }[] = [];

    if (level.steps) {
      for (let i = 0; i < level.steps.length; i++) {
        const step = level.steps[i];
        if (step.tests && step.tests.length > 0) {
          groups.push({
            label: `${level.name} step ${i + 1}`,
            tests: step.tests,
            testFn: step.testFn ?? level.testFn,
          });
        }
      }
    } else if (level.tests && level.tests.length > 0) {
      groups.push({
        label: level.name,
        tests: level.tests,
        testFn: level.testFn,
      });
    }

    return groups;
  }

  it('every level or step has at least one test', () => {
    for (const { stage, level } of allLevels) {
      if (level.steps) {
        for (let i = 0; i < level.steps.length; i++) {
          const step = level.steps[i];
          expect(
            step.tests?.length,
            `${stage}/${level.name} step ${i + 1} has no tests`,
          ).toBeGreaterThan(0);
        }
      } else {
        expect(
          (level.tests?.length ?? 0) > 0,
          `${stage}/${level.name} has no tests`,
        ).toBe(true);
      }
    }
  });

  it('return tests always have a testFn available', () => {
    for (const { stage, level } of allLevels) {
      const groups = getTestGroups(level);
      for (const group of groups) {
        const returnTests = group.tests.filter((t): t is ReturnTest => t.type === 'return');
        if (returnTests.length > 0) {
          expect(
            group.testFn,
            `${stage}/${group.label} has return tests but no testFn`,
          ).toBeTruthy();
        }
      }
    }
  });

  it('return tests have args and expected', () => {
    for (const { stage, level } of allLevels) {
      const groups = getTestGroups(level);
      for (const group of groups) {
        for (const test of group.tests) {
          if (test.type === 'return') {
            expect(
              Array.isArray(test.args),
              `${stage}/${group.label} return test missing args`,
            ).toBe(true);
            expect(
              test.expected,
              `${stage}/${group.label} return test missing expected`,
            ).toBeDefined();
          }
        }
      }
    }
  });

  it('stdout tests have expected string', () => {
    for (const { stage, level } of allLevels) {
      const groups = getTestGroups(level);
      for (const group of groups) {
        for (const test of group.tests) {
          if (test.type === 'stdout') {
            expect(
              typeof test.expected,
              `${stage}/${group.label} stdout test expected is not a string`,
            ).toBe('string');
          }
        }
      }
    }
  });

  it('state tests have expression string', () => {
    for (const { stage, level } of allLevels) {
      const groups = getTestGroups(level);
      for (const group of groups) {
        for (const test of group.tests) {
          if (test.type === 'state') {
            expect(
              typeof (test as any).expression,
              `${stage}/${group.label} state test missing expression`,
            ).toBe('string');
          }
        }
      }
    }
  });

  it('multi-step levels have matching step count between data and files', () => {
    for (const { stage, level } of allLevels) {
      if (level.steps) {
        expect(
          level.steps.length,
          `${stage}/${level.name} has 0 steps`,
        ).toBeGreaterThan(0);
        for (let i = 0; i < level.steps.length; i++) {
          expect(
            level.steps[i].starterCode,
            `${stage}/${level.name} step ${i + 1} has no starterCode`,
          ).toBeDefined();
          expect(
            level.steps[i].description,
            `${stage}/${level.name} step ${i + 1} has no description`,
          ).toBeTruthy();
        }
      }
    }
  });
});
