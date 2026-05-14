import Phaser from 'phaser';
import { useEffect, useRef } from 'preact/hooks';
import { EditorView } from 'codemirror';
import { BaseScene } from '../phaser/BaseScene';
import { useSceneStore } from '../stores/sceneStore';
import { useGameStore } from '../stores/gameStore';
import { stages } from '../stages/stages';
import { runPythonTraced } from '../api/pyodide';
import { highlightLine } from '../components/CodeEditor';
import {
	getLevelProgress,
	type LevelProgress,
	markLevelCompleted,
	markStepCompleted,
	resetLevelProgress,
	saveLevelCode,
	saveStepCode,
} from '../progress';
import type { Level, Step, Test } from '../types';
import { buildCompletedSteps, resolveDraftCode, buildEvaluateExpr, checkSingleTest } from './testUtils';

// ── hook ──

export function useGameActions() {
	const currentStage = useSceneStore((s) => s.stage);
	const currentLevel = useSceneStore((s) => s.level);

	const store = useGameStore();

	const editorViewRef = useRef<EditorView | null>(null);
	const gameRef = useRef<Phaser.Game | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const speedRef = useRef(store.speed);
	const saveTimeoutRef = useRef<number | null>(null);

	const stage = stages.find((s) => s.id === currentStage);
	const level = stage?.levels.find((l) => l.id === currentLevel);

	const steps = level?.steps;
	const activeStep: Step | undefined = steps?.[store.currentStep];
	const stepDescription = activeStep?.description ?? level?.description ?? '';
	const stepTests = activeStep?.tests ?? level?.tests ?? [];
	const testFn = activeStep?.testFn ?? level?.testFn;

	// keep speedRef in sync
	speedRef.current = store.speed;

	// init test results when tests change
	useEffect(() => {
		if (stepTests.length > 0) {
			store.initTestResults(stepTests.length);
		}
	}, [stepTests.length, store.currentStep, currentStage, currentLevel]);

	// ── progress loading ──

	const loadProgress = async (stepIndex: number) => {
		if (!level) {
			store.setCompletedSteps([]);
			store.setInitialEditorCode('');
			store.setIsProgressLoaded(true);
			return;
		}
		const progress = await getLevelProgress(currentStage, currentLevel);
		store.setCompletedSteps(buildCompletedSteps(progress, steps));
		store.setInitialEditorCode(resolveDraftCode(level, progress, stepIndex));
		store.setIsProgressLoaded(true);
	};

	useEffect(() => {
		let cancelled = false;
		store.setIsProgressLoaded(false);

		(async () => {
			const progress = level
				? await getLevelProgress(currentStage, currentLevel)
				: null;
			if (cancelled) return;

			store.setCompletedSteps(buildCompletedSteps(progress, steps));
			store.setInitialEditorCode(level ? resolveDraftCode(level, progress, store.currentStep) : '');
			store.setIsProgressLoaded(true);
		})();

		return () => { cancelled = true; };
	}, [currentStage, currentLevel, store.currentStep, level, steps]);

	// cleanup save timeout on unmount
	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current !== null) {
				window.clearTimeout(saveTimeoutRef.current);
			}
		};
	}, []);

	// preview the selected test's maze (or level levelData) on the canvas.
	// fires on level/step/test changes; skipped while an animation is running so
	// the end-of-playback state stays visible.
	useEffect(() => {
		if (store.isPlaying) return;
		return applySceneDataForTest(store.selectedTest);
	}, [level, store.currentStep, store.selectedTest]);

	// ── helpers ──

	const clearPendingSave = () => {
		if (saveTimeoutRef.current !== null) {
			window.clearTimeout(saveTimeoutRef.current);
			saveTimeoutRef.current = null;
		}
	};

	const getCode = () => editorViewRef.current?.state.doc.toString() ?? '';

	const saveCode = async () => {
		const code = getCode();
		clearPendingSave();
		if (steps) {
			await saveStepCode(currentStage, currentLevel, store.currentStep, code);
		} else {
			await saveLevelCode(currentStage, currentLevel, code);
		}
	};

	const executeCode = async (code: string, evaluate?: string, testLevelData?: Record<string, any>) => {
		const modules = level?.pythonModules;
		const levelData = testLevelData ?? level?.levelData;
		return runPythonTraced(code, modules, levelData, evaluate);
	};

	/** Push current test's levelData into the scene as a preview/reset.
	 *  Polls via rAF until the Phaser game + scene are ready, then fires
	 *  scene.onPlaybackStart. Survives refs-aren't-reactive timing issues. */
	const applySceneDataForTest = (testIndex: number): (() => void) | undefined => {
		if (!level?.phaserScene) return;
		const data = stepTests[testIndex]?.levelData ?? level.levelData;
		if (!data) return;

		let rafId: number | null = null;
		let cancelled = false;
		let attempts = 0;
		const MAX_ATTEMPTS = 300; // ~5s @ 60fps; bail if scene never boots

		const tick = () => {
			if (cancelled) return;
			attempts++;
			const game = gameRef.current;
			const scene = game?.scene.getScene(level.phaserScene!.name) as BaseScene | undefined;
			// 5 === Phaser.Scenes.RUNNING — scene's create() has completed
			if (scene && scene.sys.settings.status >= 5) {
				scene.onPlaybackStart(data);
				return;
			}
			if (attempts >= MAX_ATTEMPTS) return;
			rafId = requestAnimationFrame(tick);
		};
		tick();

		return () => {
			cancelled = true;
			if (rafId !== null) cancelAnimationFrame(rafId);
		};
	};

	// ── playback (used by handleTestOne) ──

	const runPlayback = async (
		view: EditorView,
		stdout: string[],
		lineTrace: number[],
		stdoutCounts: number[],
		events: { action: string; args: any[]; step: number }[] | undefined,
		testIndex: number,
		testLevelData?: Record<string, any>,
	) => {
		store.setIsPlaying(true);
		store.setTestLocked(true);
		store.setTestResult(testIndex, { stdout: [] });
		const abort = new AbortController();
		abortRef.current = abort;

		const levelData = testLevelData ?? level?.levelData;
		const scene = level?.phaserScene
			? (gameRef.current?.scene.getScene(level.phaserScene.name) as BaseScene | undefined)
			: undefined;
		scene?.onPlaybackStart(levelData);

		// pre-index events by step
		const eventsByStep = new Map<number, typeof events>();
		for (const evt of events ?? []) {
			const list = eventsByStep.get(evt.step) ?? [];
			list.push(evt);
			eventsByStep.set(evt.step, list);
		}

		for (let i = 0; i < lineTrace.length; i++) {
			if (abort.signal.aborted) break;
			highlightLine(view, lineTrace[i]);
			const outputCount = stdoutCounts[i + 1] ?? stdout.length;
			store.setTestResult(testIndex, { stdout: stdout.slice(0, outputCount) });

			const stepEvents = eventsByStep.get(i);
			if (stepEvents) {
				for (const evt of stepEvents) {
					scene?.onEvent(evt.action, evt.args);
				}
			}
			await new Promise((r) => setTimeout(r, parseInt(speedRef.current, 10)));
		}

		scene?.onPlaybackEnd();
		highlightLine(view, null);

		if (abort.signal.aborted) {
			store.setTestResult(testIndex, { messages: ['-- aborted early --'] });
		} else {
			store.setTestResult(testIndex, { stdout });
		}
		store.setIsPlaying(false);
		store.setTestLocked(false);
		abortRef.current = null;

		return !abort.signal.aborted;
	};

	// ── helpers ──

	/** Check if all tests passed and there are no hidden tests — if so, trigger completion */
	const checkAutoComplete = async () => {
		const hasHidden = stepTests.some((t) => t.hidden);
		if (hasHidden) return;

		const results = useGameStore.getState().testResults;
		const allPassed = results.length > 0 && results.every((r) => r.passed === true);
		if (allPassed) {
			await applyCompletion();
		}
	};

	// ── actions ──

	/** Run a single test case with playback */
	const handleTestOne = async (testIndex: number) => {
		if (!level || testIndex >= stepTests.length) return;

		const test = stepTests[testIndex];
		store.setIsRunning(true);
		store.setActiveTab('console');
		store.setSelectedTest(testIndex);
		store.setTestResult(testIndex, { stdout: [], messages: [], error: null, passed: null });

		const code = getCode();
		await saveCode();

		const evaluate = buildEvaluateExpr(test, testFn);
		const { result, stdout, lineTrace, stdoutCounts, events, error } = await executeCode(code, evaluate, test.levelData);
		store.setIsRunning(false);

		if (error) {
			store.setTestResult(testIndex, { stdout, error, passed: false });
			return;
		}

		const view = editorViewRef.current;
		if (lineTrace?.length > 0 && view) {
			const completed = await runPlayback(view, stdout, lineTrace, stdoutCounts, events, testIndex, test.levelData);
			if (completed) {
				const passed = checkSingleTest(test, stdout, result);
				store.setTestResult(testIndex, { passed });
				await checkAutoComplete();
			}
		} else {
			const passed = checkSingleTest(test, stdout, result);
			store.setTestResult(testIndex, { stdout, passed });
			await checkAutoComplete();
		}
	};

	/** Run all test cases instantly without playback */
	const handleTestAll = async () => {
		if (!level) return;

		store.setIsRunning(true);
		store.setActiveTab('console');

		const code = getCode();
		await saveCode();

		for (let i = 0; i < stepTests.length; i++) {
			const test = stepTests[i];
			if (test.hidden) continue;
			store.setTestResult(i, { stdout: [], messages: [], error: null, passed: null });

			const evaluate = buildEvaluateExpr(test, testFn);
			const { result, stdout, error } = await executeCode(code, evaluate, test.levelData);

			if (error) {
				store.setTestResult(i, { stdout, error, passed: false });
			} else {
				const passed = checkSingleTest(test, stdout, result);
				store.setTestResult(i, { stdout, passed });
			}
		}

		store.setIsRunning(false);
		await checkAutoComplete();
	};

	/** Run all tests (including hidden), complete level/step if all pass */
	const handleVerify = async () => {
		if (!level) return;

		store.setIsRunning(true);
		store.setActiveTab('console');

		const code = getCode();
		await saveCode();

		let allPassed = true;

		for (let i = 0; i < stepTests.length; i++) {
			const test = stepTests[i];
			store.setTestResult(i, { stdout: [], messages: [], error: null, passed: null });

			const evaluate = buildEvaluateExpr(test, testFn);
			const { result, stdout, error } = await executeCode(code, evaluate, test.levelData);

			if (error) {
				store.setTestResult(i, { stdout, error, passed: false });
				allPassed = false;
			} else {
				const passed = checkSingleTest(test, stdout, result);
				store.setTestResult(i, { stdout, passed });
				if (!passed) allPassed = false;
			}
		}

		store.setIsRunning(false);

		if (allPassed) {
			await applyCompletion();
		}
	};

	const applyCompletion = async () => {
		if (steps) {
			const next = [...store.completedSteps];
			next[store.currentStep] = true;
			store.setCompletedSteps(next);
			await markStepCompleted(currentStage, currentLevel, store.currentStep, true);

			const allDone = steps.every((_, i) => !!next[i]);
			if (allDone) {
				await markLevelCompleted(currentStage, currentLevel, true);
				store.setShowWinScreen(true);
			} else if (store.currentStep < steps.length - 1) {
				// Step completed, next step unlocked — show via Next Step button
			}
		} else {
			await markLevelCompleted(currentStage, currentLevel, true);
			store.setShowWinScreen(true);
		}
	};

	const handleStop = () => {
		abortRef.current?.abort();
	};

	/** Reset the selected test: clear its result, restore the canvas to the
	 *  test's starting state, and drop the editor line highlight. */
	const handleReset = () => {
		if (store.isPlaying) return;
		store.setTestResult(store.selectedTest, { stdout: [], messages: [], error: null, passed: null });
		applySceneDataForTest(store.selectedTest);
		const view = editorViewRef.current;
		if (view) highlightLine(view, null);
	};

	const handleNextStep = () => {
		if (steps && store.currentStep < steps.length - 1) {
			goToStep(store.currentStep + 1);
		}
	};

	const goToStep = (step: number) => {
		store.setCurrentStep(step);
		store.resetConsole();
	};

	const handleCodeChange = (code: string) => {
		if (!level) return;

		if (saveTimeoutRef.current !== null) {
			window.clearTimeout(saveTimeoutRef.current);
		}
		saveTimeoutRef.current = window.setTimeout(() => {
			if (steps) {
				void saveStepCode(currentStage, currentLevel, store.currentStep, code);
			} else {
				void saveLevelCode(currentStage, currentLevel, code);
			}
		}, 250);

		if (level.needsCodeUpdate && level.phaserScene) {
			const scene = gameRef.current?.scene.getScene(level.phaserScene.name) as BaseScene | undefined;
			scene?.updateCode(code);
		}
	};

	const handleResetLevel = async () => {
		if (!level) return;
		clearPendingSave();
		await resetLevelProgress(currentStage, currentLevel);
		store.setCurrentStep(0);
		store.resetConsole();
		await loadProgress(0);
	};

	return {
		// data
		level,
		steps,
		stepDescription,
		stepTests,

		// refs
		editorViewRef,
		gameRef,

		// actions
		handleTestOne,
		handleTestAll,
		handleVerify,
		handleStop,
		handleReset,
		handleNextStep,
		goToStep,
		handleCodeChange,
		handleResetLevel,
	};
}
