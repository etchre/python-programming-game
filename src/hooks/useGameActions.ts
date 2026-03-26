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
	resetAllProgress,
	resetLevelProgress,
	saveLevelCode,
	saveStepCode,
} from '../progress';
import type { Level, Step } from '../types';

// ── pure helpers ──

function buildCompletedSteps(progress: LevelProgress | null, steps: Step[] | undefined): boolean[] {
	if (!steps) return [];
	return steps.map((_, i) => !!progress?.steps?.[i]?.completed);
}

function resolveDraftCode(level: Level, progress: LevelProgress | null, stepIndex: number): string {
	if (!level.steps) {
		return progress?.code ?? level.starterCode;
	}
	const saved = progress?.steps?.[stepIndex]?.code;
	if (saved != null) return saved;
	return level.steps[stepIndex]?.starterCode ?? level.starterCode;
}

function checkTestsPassed(stdout: string[], tests: { expected: string }[]): boolean {
	return tests.length === 0 || tests.every((t) => stdout.join('\n').trim() === t.expected.trim());
}

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

	// keep speedRef in sync
	speedRef.current = store.speed;

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

	// ── actions ──

	const clearPendingSave = () => {
		if (saveTimeoutRef.current !== null) {
			window.clearTimeout(saveTimeoutRef.current);
			saveTimeoutRef.current = null;
		}
	};

	const handleRun = async () => {
		if (!level) return;

		store.setIsRunning(true);
		store.setActiveTab('console');
		store.setConsoleMessages([]);
		const code = editorViewRef.current?.state.doc.toString() ?? '';

		clearPendingSave();
		if (steps) {
			await saveStepCode(currentStage, currentLevel, store.currentStep, code);
		} else {
			await saveLevelCode(currentStage, currentLevel, code);
		}

		const modules = level.pythonModules;
		const levelData = level.levelData;
		const [{ stdout, lineTrace, stdoutCounts, events }] = await Promise.all([
			runPythonTraced(code, modules, levelData),
			new Promise((r) => setTimeout(r, 500)),
		]);
		store.setIsRunning(false);

		const view = editorViewRef.current;
		if (lineTrace?.length > 0 && view) {
			await runPlayback(view, level, stdout, lineTrace, stdoutCounts, events, levelData);
		} else {
			store.setConsoleOutput(stdout);
			await applyCompletion(stdout);
		}
	};

	const runPlayback = async (
		view: EditorView,
		level: Level,
		stdout: string[],
		lineTrace: number[],
		stdoutCounts: number[],
		events: { action: string; args: any[]; step: number }[] | undefined,
		levelData: any,
	) => {
		store.setIsPlaying(true);
		store.setConsoleOutput([]);
		const abort = new AbortController();
		abortRef.current = abort;

		const scene = level.phaserScene
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
			store.setConsoleOutput(stdout.slice(0, outputCount));

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
			store.setConsoleMessages(['-- aborted early --']);
		} else {
			store.setConsoleOutput(stdout);
			await applyCompletion(stdout);
		}
		store.setIsPlaying(false);
		abortRef.current = null;
	};

	const applyCompletion = async (stdout: string[]) => {
		const passed = checkTestsPassed(stdout, stepTests);

		if (passed && steps) {
			const next = [...store.completedSteps];
			next[store.currentStep] = true;
			store.setCompletedSteps(next);
			await markStepCompleted(currentStage, currentLevel, store.currentStep, true);

			if (steps.every((_, i) => !!next[i])) {
				await markLevelCompleted(currentStage, currentLevel, true);
			}

			store.setConsoleMessages([
				store.currentStep < steps.length - 1 ? '-- step completed! --' : '-- level completed! --',
			]);
			return;
		}

		if (passed) {
			await markLevelCompleted(currentStage, currentLevel, true);
			store.setConsoleMessages(['-- fully completed --']);
			return;
		}

		store.setConsoleMessages(['-- tests did not pass --']);
	};

	const handleStop = () => {
		abortRef.current?.abort();
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

	const handleResetAll = async () => {
		clearPendingSave();
		await resetAllProgress();
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
		handleRun,
		handleStop,
		handleNextStep,
		goToStep,
		handleCodeChange,
		handleResetLevel,
		handleResetAll,
	};
}
