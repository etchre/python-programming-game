import { Box, Text, ActionIcon, Group } from '@mantine/core';
import { useState } from 'preact/hooks';
import { useGameStore } from '../../stores/gameStore';
import { Test } from '../../types';
import { TestBar } from './TestBar';
import { ConsoleOutput } from './ConsoleOutput';

interface InfoPanelProps {
	description: string;
	tests: Test[];
	onTestOne: (index: number) => void;
	onTestAll: () => void;
}

export function InfoPanel({ description, tests, onTestOne, onTestAll }: InfoPanelProps) {
	const [descExpanded, setDescExpanded] = useState(true);
	const selectedTest = useGameStore((s) => s.selectedTest);
	const testResults = useGameStore((s) => s.testResults);

	return (
		<Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			{/* Description section */}
			<Box style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
				<Group px="sm" py={6} justify="space-between">
					<Text size="sm" fw={600}>Description</Text>
					<ActionIcon
						size="sm"
						variant="subtle"
						onClick={() => setDescExpanded(!descExpanded)}
						style={{
							transition: 'transform 0.2s ease',
							transform: descExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
						}}
					>
						▾
					</ActionIcon>
				</Group>
				<Box style={{
					overflow: 'hidden',
					maxHeight: descExpanded ? 300 : 0,
					transition: 'max-height 0.25s ease',
				}}>
					<Box px="sm" pb="sm">
						<Text size="sm">{description}</Text>
					</Box>
				</Box>
			</Box>

			{/* Console section — fills remaining space */}
			<Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
				<TestBar tests={tests} onTestOne={onTestOne} onTestAll={onTestAll} />
				<ConsoleOutput result={testResults[selectedTest]} />
			</Box>
		</Box>
	);
}
