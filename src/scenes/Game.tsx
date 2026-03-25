import Phaser from 'phaser';
import { useRef, useState } from 'preact/hooks';
import { Flex, Stack } from '@mantine/core';
import { EditorView } from 'codemirror';
import { BaseScene } from '../phaser/BaseScene';
import { useSceneStore } from '../stores/sceneStore';
import { stages } from '../stages/stages';
import { runPython } from '../api/pyodide';

import { Header } from '../components/Header';
import { LeftSplit } from '../components/LeftSplit';
import { RightSplit } from '../components/RightSplit';
import { CodeEditor } from '../components/CodeEditor';
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

  // state
	const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const [activeTab, setActiveTab] = useState('description');

	const stage = stages.find((s) => s.id === currentStage);
	const level = stage?.levels.find((l) => l.id === currentLevel);

	// callback function to run the code with pyodide
	// there is a minimum delay of at least 0.5 seconds
	// if the code executes very fast, the delay will be faked
	const handleRun = async () => {
		setIsRunning(true);
		setActiveTab('console');
		const code = editorViewRef.current?.state.doc.toString() ?? '';
		const [{ stdout }] = await Promise.all([
			runPython(code),
			new Promise(r => setTimeout(r, 500)),
		]);
		setConsoleOutput(stdout);

		setIsRunning(false);
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
				loading={isRunning}
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
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          }
        />
			</Flex>
		</Stack>
	);
}
