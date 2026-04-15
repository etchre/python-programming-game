import type { Level, Step, Test } from '../types';
import type { LevelProgress } from '../progress';

export function buildCompletedSteps(progress: LevelProgress | null, steps: Step[] | undefined): boolean[] {
	if (!steps) return [];
	return steps.map((_, i) => !!progress?.steps?.[i]?.completed);
}

export function resolveDraftCode(level: Level, progress: LevelProgress | null, stepIndex: number): string {
	if (!level.steps) {
		return progress?.code ?? level.starterCode;
	}
	const saved = progress?.steps?.[stepIndex]?.code;
	if (saved != null) return saved;
	return level.steps[stepIndex]?.starterCode ?? level.starterCode;
}

/** Build the evaluate expression for a test, or undefined for stdout tests */
export function buildEvaluateExpr(test: Test, testFn?: string): string | undefined {
	switch (test.type) {
		case 'stdout':
			return undefined;
		case 'return': {
			if (!testFn) throw new Error('Return tests require a testFn on the level or step');
			const argsStr = test.args.map((a) => JSON.stringify(a)).join(', ');
			return `str(${testFn}(${argsStr}))`;
		}
		case 'state':
			return `str(bool(${test.expression}))`;
	}
}

/** Check if a test passed given execution results */
export function checkSingleTest(test: Test, stdout: string[], evalResult: string | null): boolean {
	switch (test.type) {
		case 'stdout':
			return stdout.join('\n').trim() === test.expected.trim();
		case 'return':
			return evalResult?.trim() === test.expected.trim();
		case 'state':
			return evalResult === 'True';
	}
}
