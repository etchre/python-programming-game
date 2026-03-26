import { Flex, Stack, Text } from '@mantine/core';
import { useSceneStore } from '../stores/sceneStore';
import { useGameStore } from '../stores/gameStore';
import { useGameActions } from '../hooks/useGameActions';

import { Header } from '../components/Header';
import { GameHeader } from '../components/GameHeader';
import { LeftSplit } from '../components/LeftSplit';
import { RightSplit } from '../components/RightSplit';
import { CodeEditor } from '../components/CodeEditor';
import { InfoPanel } from '../components/InfoPanel';
import { GameCanvas } from '../components/GameCanvas';

export function Game() {
	const setScene = useSceneStore((s) => s.setScene);
	const currentStage = useSceneStore((s) => s.stage);
	const currentLevel = useSceneStore((s) => s.level);
	const currentStep = useGameStore((s) => s.currentStep);
	const completedSteps = useGameStore((s) => s.completedSteps);
	const isProgressLoaded = useGameStore((s) => s.isProgressLoaded);
	const initialEditorCode = useGameStore((s) => s.initialEditorCode);

	const {
		level,
		steps,
		stepDescription,
		stepTests,
		editorViewRef,
		gameRef,
		handleRun,
		handleStop,
		handleNextStep,
		goToStep,
		handleCodeChange,
		handleResetLevel,
		handleResetAll,
	} = useGameActions();

	if (!level) {
		return (
			<Stack h="100vh" gap={0}>
				<Header title="Missing level" onBack={() => setScene('levelselect')} />
				<Flex style={{ flex: 1 }} align="center" justify="center">
					<Text>No level data found.</Text>
				</Flex>
			</Stack>
		);
	}

	return (
		<Stack h="100vh" gap={0}>
			<GameHeader
				title={level.name}
				onBack={() => setScene('levelselect')}
				onRun={handleRun}
				onStop={handleStop}
				onNextStep={steps && completedSteps[currentStep] && currentStep < steps.length - 1 ? handleNextStep : undefined}
				onStepClick={steps ? goToStep : undefined}
				totalSteps={steps?.length}
				onResetLevel={handleResetLevel}
				onResetAll={handleResetAll}
			/>
			<Flex style={{ flex: 1, minHeight: 0 }}>
				<LeftSplit>
					{isProgressLoaded && (
						<CodeEditor
							key={`${currentStage}-${currentLevel}-${currentStep}`}
							initialCode={initialEditorCode}
							editorViewRef={editorViewRef}
							onCodeChange={handleCodeChange}
						/>
					)}
				</LeftSplit>
				<RightSplit
					top={<GameCanvas level={level} gameRef={gameRef} />}
					bottom={
						<InfoPanel
							description={stepDescription}
							tests={stepTests}
						/>
					}
				/>
			</Flex>
		</Stack>
	);
}
