import { Box, Flex, Stack } from '@mantine/core';
import { useSceneStore } from '../stores/sceneStore';
import { stages } from '../stages/stages';

import { Header } from '../components/Header';
import { LeftSplit } from '../components/LeftSplit';
import { RightSplit } from '../components/RightSplit';
import { CodeEditor } from '../components/CodeEditor';
import { InfoPanel } from '../components/InfoPanel';

export function Game() {
	const currentStage = useSceneStore((s) => s.stage);
	const currentLevel = useSceneStore((s) => s.level);
	const setScene = useSceneStore((s) => s.setScene);

	// use the ids from the state to fetch the current stage
	// from the levels array within that, find the current level title
	const stage = stages.find((s) => s.id === currentStage);
	const level = stage?.levels.find((l) => l.id === currentLevel);

	return (
		<Stack h="100vh" gap={0}>
			<Header
				title={level?.name ?? 'error... no title found!'}
				onBack={() => setScene('levelselect')}
				showRun
			/>
			<Flex style={{ flex: 1 }}>
				<LeftSplit>
					<CodeEditor initialCode={level?.starterCode} />
				</LeftSplit>
				<RightSplit
					top={null /* Canvas will go here */}
          bottom={
            <InfoPanel
              description={level?.description ?? 'error... no description found!'}
              tests={level?.tests ?? []}
            />
          }
        />
			</Flex>
		</Stack>
	);
}
