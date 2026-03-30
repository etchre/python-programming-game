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
import { WinScreen } from '../components/WinScreen';

export function Game() {
	const setScene = useSceneStore((s) => s.setScene);
	const currentStage = useSceneStore((s) => s.stage);
	const currentLevel = useSceneStore((s) => s.level);
	const currentStep = useGameStore((s) => s.currentStep);
	const completedSteps = useGameStore((s) => s.completedSteps);
	const isProgressLoaded = useGameStore((s) => s.isProgressLoaded);
	const initialEditorCode = useGameStore((s) => s.initialEditorCode);
	const showWinScreen = useGameStore((s) => s.showWinScreen);
	const setShowWinScreen = useGameStore((s) => s.setShowWinScreen);

	const {
		level,
		steps,
		stepDescription,
		stepTests,
		editorViewRef,
		gameRef,
		handleTestOne,
		handleTestAll,
		handleVerify,
		handleStop,
		handleNextStep,
		goToStep,
		handleCodeChange,
		handleResetLevel,
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
		<Stack h="100vh" gap={0} style={{ position: 'relative' }}>
			<GameHeader
				title={level.name}
				onBack={() => setScene('levelselect')}
				onVerify={handleVerify}
				onStop={handleStop}
				onNextStep={steps && completedSteps[currentStep] && currentStep < steps.length - 1 ? handleNextStep : undefined}
				onStepClick={steps ? goToStep : undefined}
				totalSteps={steps?.length}
				onResetLevel={handleResetLevel}
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
							onTestOne={handleTestOne}
							onTestAll={handleTestAll}
						/>
					}
				/>
			</Flex>

			{showWinScreen && (
				<WinScreen
					hasNextStep={!!steps && currentStep < steps.length - 1}
					onStay={() => setShowWinScreen(false)}
					onNextLevel={() => setScene('levelselect')}
					onNextStep={() => { setShowWinScreen(false); handleNextStep(); }}
					onLevelSelect={() => setScene('levelselect')}
				/>
			)}
		</Stack>
	);
}
