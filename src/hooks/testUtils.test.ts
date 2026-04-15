import { describe, it, expect } from 'vitest';
import { buildEvaluateExpr, checkSingleTest } from './testUtils';
import type { StdoutTest, ReturnTest, StateTest } from '../types/Test';

describe('buildEvaluateExpr', () => {
  it('returns undefined for stdout tests', () => {
    const test: StdoutTest = { type: 'stdout', expected: 'hi' };
    expect(buildEvaluateExpr(test)).toBeUndefined();
  });

  it('builds expression for return tests with simple args', () => {
    const test: ReturnTest = { type: 'return', args: [5, 10], expected: '15' };
    expect(buildEvaluateExpr(test, 'add')).toBe('str(add(5, 10))');
  });

  it('builds expression for return tests with string args', () => {
    const test: ReturnTest = { type: 'return', args: ['hello'], expected: 'HELLO' };
    expect(buildEvaluateExpr(test, 'upper')).toBe('str(upper("hello"))');
  });

  it('builds expression for return tests with array args', () => {
    const test: ReturnTest = { type: 'return', args: [[1, 2, 3]], expected: '[1, 2, 3]' };
    expect(buildEvaluateExpr(test, 'identity')).toBe('str(identity([1,2,3]))');
  });

  it('throws if return test has no testFn', () => {
    const test: ReturnTest = { type: 'return', args: [1], expected: '1' };
    expect(() => buildEvaluateExpr(test)).toThrow('Return tests require a testFn');
  });

  it('builds expression for state tests', () => {
    const test: StateTest = { type: 'state', expression: 'len(x) > 0' };
    expect(buildEvaluateExpr(test)).toBe('str(bool(len(x) > 0))');
  });
});

describe('checkSingleTest', () => {
  describe('stdout tests', () => {
    const test: StdoutTest = { type: 'stdout', expected: 'hello\nworld' };

    it('passes when stdout matches', () => {
      expect(checkSingleTest(test, ['hello', 'world'], null)).toBe(true);
    });

    it('fails when stdout differs', () => {
      expect(checkSingleTest(test, ['hello'], null)).toBe(false);
    });

    it('trims whitespace on both sides', () => {
      expect(checkSingleTest(test, ['hello', 'world', ''], null)).toBe(true);
    });
  });

  describe('return tests', () => {
    const test: ReturnTest = { type: 'return', args: [1], expected: '42' };

    it('passes when eval result matches', () => {
      expect(checkSingleTest(test, [], '42')).toBe(true);
    });

    it('passes with extra whitespace in result', () => {
      expect(checkSingleTest(test, [], '  42  ')).toBe(true);
    });

    it('fails when result differs', () => {
      expect(checkSingleTest(test, [], '43')).toBe(false);
    });

    it('fails when result is null', () => {
      expect(checkSingleTest(test, [], null)).toBe(false);
    });
  });

  describe('state tests', () => {
    const test: StateTest = { type: 'state', expression: 'x > 0' };

    it('passes when eval result is True', () => {
      expect(checkSingleTest(test, [], 'True')).toBe(true);
    });

    it('fails when eval result is False', () => {
      expect(checkSingleTest(test, [], 'False')).toBe(false);
    });

    it('fails when eval result is null', () => {
      expect(checkSingleTest(test, [], null)).toBe(false);
    });
  });
});
