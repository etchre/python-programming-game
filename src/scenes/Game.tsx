import Phaser from 'phaser';
import { useRef, useState } from 'preact/hooks';
import { Flex, Stack } from '@mantine/core';
import { EditorView } from 'codemirror';
import { BaseScene } from '../phaser/BaseScene';
import { useSceneStore } from '../stores/sceneStore';
import { stages } from '../stages/stages';
import { runPythonTraced } from '../api/pyodide';

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

	const stage = stages.find((s) => s.id === currentStage);
	const level = stage?.levels.find((l) => l.id === currentLevel);

	// callback whenever the run button is pressed
	const handleRun = async () => {
		setIsRunning(true);
		setActiveTab('console');
		setConsoleMessages([]);
		const code = editorViewRef.current?.state.doc.toString() ?? '';

		// Execute with tracing
		const [{ stdout, lineTrace, stdoutCounts }] = await Promise.all([
			runPythonTraced(code),
			new Promise(r => setTimeout(r, 500)),
		]);
		setIsRunning(false);

		// Playback the line trace with synced console output
		const view = editorViewRef.current;
		if (lineTrace?.length > 0 && view) {
			setIsPlaying(true);
			setConsoleOutput([]);
			const abort = new AbortController();
			abortRef.current = abort;

			for (let i = 0; i < lineTrace.length; i++) {
				if (abort.signal.aborted) break;
				highlightLine(view, lineTrace[i]);
				// Show stdout up to what the NEXT step sees (i.e. after this line executed)
				const outputCount = stdoutCounts[i + 1] ?? stdout.length;
				setConsoleOutput(stdout.slice(0, outputCount));
				await new Promise(r => setTimeout(r, parseInt(speedRef.current)));
			}

			highlightLine(view, null);
			if (abort.signal.aborted) {
				setConsoleMessages(['-- aborted early --']);
			} else {
				setConsoleOutput(stdout);
				setConsoleMessages(['-- fully completed --']);
			}
			setIsPlaying(false);
			abortRef.current = null;
		} else {
			setConsoleOutput(stdout);
			setConsoleMessages(['-- fully completed --']);
		}
	};

	const handleStop = () => {
		abortRef.current?.abort();
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
				loading={isRunning}
				isPlaying={isPlaying}
				speed={speed}
				onSpeedChange={(v) => { speedRef.current = v; setSpeed(v); }}
			/>
			<Flex style={{ flex: 1, minHeight: 0 }}>
				<LeftSplit>
					<CodeEditor
						initialCode={level?.starterCode}
						editorViewRef={editorViewRef}
						onCodeChange={handleCodeChange}
					/>
				</LeftSplit>
				<RightSplit
					top={level ? <GameCanvas level={level} gameRef={gameRef} /> : null}
          bottom={
            <InfoPanel
              description={level?.description ?? 'error... no description found!'}
              tests={level?.tests ?? []}
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
