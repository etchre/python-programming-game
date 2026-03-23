import { useRef, useState } from 'preact/hooks';
import { Flex, Stack } from '@mantine/core';
import Phaser from 'phaser';
import { EditorView } from 'codemirror';
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
	const currentStage = useSceneStore((s) => s.stage);
	const currentLevel = useSceneStore((s) => s.level);
	const setScene = useSceneStore((s) => s.setScene);
	const editorViewRef = useRef<EditorView | null>(null);
	const gameRef = useRef<Phaser.Game | null>(null);
	const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

	const stage = stages.find((s) => s.id === currentStage);
	const level = stage?.levels.find((l) => l.id === currentLevel);

	const handleRun = async () => {
		const code = editorViewRef.current?.state.doc.toString() ?? '';
		const { stdout } = await runPython(code);
		setConsoleOutput(stdout);
	};

	const handleCodeChange = (code: string) => {
		if (!gameRef.current || !level) return;
		const scene = gameRef.current.scene.getScene(level.phaserScene.name) as any;
		scene?.updateCode?.(code);
	};

	return (
		<Stack h="100vh" gap={0}>
			<Header
				title={level?.name ?? 'error... no title found!'}
				onBack={() => setScene('levelselect')}
				onRun={handleRun}
			/>
			<Flex style={{ flex: 1 }}>
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
            />
          }
        />
			</Flex>
		</Stack>
	);
}
