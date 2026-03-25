import Phaser from 'phaser';
import { useRef, useState } from 'preact/hooks';
import { Flex, Stack } from '@mantine/core';
import { EditorView } from 'codemirror';
import { BaseScene } from '../phaser/BaseScene';
import { useSceneStore } from '../stores/sceneStore';
import { stages } from '../stages/stages';
import { runPythonTraced } from '../api/pyodide';
import type { Step } from '../types';

import { Header } from '../components/Header';
import { LeftSplit } from '../components/LeftSplit';
import { RightSplit } from '../components/RightSplit';
import { CodeEditor, highlightLine } from '../components/CodeEditor';
import { InfoPanel } from '../components/InfoPanel';
import { GameCanvas } from '../components/GameCanvas';

export function Game() {
  // stores
	const currentStage = useSceneStore((s) => s.stage);
	const currentLevel = useSceneStore((s) => s.level);
  const setScene = useSceneStore((s) => s.setScene);

  // refs
	const editorViewRef = useRef<EditorView | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const speedRef = useRef('200');

  // state
	const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
	const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [activeTab, setActiveTab] = useState('description');
	const [speed, setSpeed] = useState('200');
	const [currentStep, setCurrentStep] = useState(0);
	const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);

	const stage = stages.find((s) => s.id === currentStage);
	const level = stage?.levels.find((l) => l.id === currentLevel);

	// derive step-aware values
	const steps = level?.steps;
	const activeStep: Step | undefined = steps?.[currentStep];
	const stepStarterCode = activeStep?.starterCode ?? level?.starterCode ?? '';
	const stepDescription = activeStep?.description ?? level?.description ?? '';
	const stepTests = activeStep?.tests ?? level?.tests ?? [];

	// callback whenever the run button is pressed
	const handleRun = async () => {
		setIsRunning(true);
		setActiveTab('console');
		setConsoleMessages([]);
		const code = editorViewRef.current?.state.doc.toString() ?? '';

		// Execute with tracing, passing level's Python modules and data
		const modules = level?.pythonModules;
		const levelData = level?.levelData;
		const [{ stdout, lineTrace, stdoutCounts, events }] = await Promise.all([
			runPythonTraced(code, modules, levelData),
			new Promise(r => setTimeout(r, 500)),
		]);
		setIsRunning(false);

		// Playback the line trace with synced console output and game events
		const view = editorViewRef.current;
		if (lineTrace?.length > 0 && view) {
			setIsPlaying(true);
			setConsoleOutput([]);
			const abort = new AbortController();
			abortRef.current = abort;

			// Get the active Phaser scene and notify it that playback is starting
			const scene = level?.phaserScene
				? gameRef.current?.scene.getScene(level.phaserScene.name) as BaseScene | undefined
				: undefined;
			scene?.onPlaybackStart(levelData);

			// Pre-index events by step for O(1) lookup
			const eventsByStep = new Map<number, typeof events>();
			for (const evt of events ?? []) {
				const list = eventsByStep.get(evt.step) ?? [];
				list.push(evt);
				eventsByStep.set(evt.step, list);
			}

			for (let i = 0; i < lineTrace.length; i++) {
				if (abort.signal.aborted) break;
				highlightLine(view, lineTrace[i]);
				// Show stdout up to what the NEXT step sees (i.e. after this line executed)
				const outputCount = stdoutCounts[i + 1] ?? stdout.length;
				setConsoleOutput(stdout.slice(0, outputCount));
				// Dispatch game events for this step
				const stepEvents = eventsByStep.get(i);
				if (stepEvents) {
					for (const evt of stepEvents) {
						scene?.onEvent(evt.action, evt.args);
					}
				}
				await new Promise(r => setTimeout(r, parseInt(speedRef.current)));
			}

			scene?.onPlaybackEnd();
			highlightLine(view, null);
			if (abort.signal.aborted) {
				setConsoleMessages(['-- aborted early --']);
			} else {
				setConsoleOutput(stdout);
				// check step/level completion
				const tests = stepTests;
				const passed = tests.length === 0 || tests.every(t => stdout.join('\n').trim() === t.expected.trim());
				if (passed && steps) {
					setCompletedSteps(prev => {
						const next = [...prev];
						next[currentStep] = true;
						return next;
					});
					if (currentStep < steps.length - 1) {
						setConsoleMessages(['-- step completed! --']);
					} else {
						setConsoleMessages(['-- level completed! --']);
					}
				} else if (passed) {
					setConsoleMessages(['-- fully completed --']);
				} else {
					setConsoleMessages(['-- tests did not pass --']);
				}
			}
			setIsPlaying(false);
			abortRef.current = null;
		} else {
			setConsoleOutput(stdout);
			const tests = stepTests;
			const passed = tests.length === 0 || tests.every(t => stdout.join('\n').trim() === t.expected.trim());
			if (passed && steps) {
				setCompletedSteps(prev => {
					const next = [...prev];
					next[currentStep] = true;
					return next;
				});
				if (currentStep < steps.length - 1) {
					setConsoleMessages(['-- step completed! --']);
				} else {
					setConsoleMessages(['-- level completed! --']);
				}
			} else if (passed) {
				setConsoleMessages(['-- fully completed --']);
			} else {
				setConsoleMessages(['-- tests did not pass --']);
			}
		}
	};

	const handleStop = () => {
		abortRef.current?.abort();
	};

	const handleNextStep = () => {
		if (steps && currentStep < steps.length - 1) {
			goToStep(currentStep + 1);
		}
	};

	const goToStep = (step: number) => {
		setCurrentStep(step);
		setConsoleOutput([]);
		setConsoleMessages([]);
		setActiveTab('description');
	};

	// give the latest code to the game canvas on every change
	// only registers this callback if the level opts in (via needsCodeUpdate)
	let handleCodeChange: ((code: string) => void) | undefined;
	if (level?.needsCodeUpdate) {
		handleCodeChange = (code: string) => {
			const scene = gameRef.current?.scene.getScene(level.phaserScene.name) as BaseScene | undefined;
			scene?.updateCode(code);
		};
	}

	return (
		<Stack h="100vh" gap={0}>
			<Header
				title={level?.name ?? 'error... no title found!'}
				onBack={() => setScene('levelselect')}
				onRun={handleRun}
				onStop={handleStop}
				onNextStep={steps && completedSteps[currentStep] && currentStep < steps.length - 1 ? handleNextStep : undefined}
				onStepClick={steps ? goToStep : undefined}
				loading={isRunning}
				isPlaying={isPlaying}
				speed={speed}
				onSpeedChange={(v) => { speedRef.current = v; setSpeed(v); }}
				totalSteps={steps?.length}
				currentStep={currentStep}
				completedSteps={completedSteps}
			/>
			<Flex style={{ flex: 1, minHeight: 0 }}>
				<LeftSplit>
					<CodeEditor
						key={`${currentLevel}-${currentStep}`}
						initialCode={stepStarterCode}
						editorViewRef={editorViewRef}
						onCodeChange={handleCodeChange}
					/>
				</LeftSplit>
				<RightSplit
					top={level ? <GameCanvas level={level} gameRef={gameRef} /> : null}
          bottom={
            <InfoPanel
              description={stepDescription}
              tests={stepTests}
              consoleOutput={consoleOutput}
              consoleMessages={consoleMessages}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          }
        />
			</Flex>
		</Stack>
	);
}
