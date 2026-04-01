import { Box, Text, Code, Button, ActionIcon, Group } from '@mantine/core';
import { useGameStore } from '../../stores/gameStore';
import { Test } from '../../types';
import { TestSquare } from './TestSquare';

interface TestBarProps {
	tests: Test[];
	onTestOne: (index: number) => void;
	onTestAll: () => void;
}

export function TestBar({ tests, onTestOne, onTestAll }: TestBarProps) {
	const testResults = useGameStore((s) => s.testResults);
	const selectedTest = useGameStore((s) => s.selectedTest);
	const setSelectedTest = useGameStore((s) => s.setSelectedTest);
	const testBarExpanded = useGameStore((s) => s.testBarExpanded);
	const setTestBarExpanded = useGameStore((s) => s.setTestBarExpanded);
	const testLocked = useGameStore((s) => s.testLocked);

	const test = tests[selectedTest];
	const result = testResults[selectedTest];

	if (tests.length === 0) return null;

	return (
		<Box style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
			{/* Squares row + chevron */}
			<Group px="sm" py={6} gap={6} justify="space-between">
				<Group gap={6}>
					{tests.filter(t => !t.hidden).map((_, i) => (
						<TestSquare
							key={i}
							number={i + 1}
							isSelected={i === selectedTest}
							passed={testResults[i]?.passed ?? null}
							locked={testLocked}
							onClick={() => setSelectedTest(i)}
						/>
					))}
				</Group>
				<Group gap={6}>
					<Button
						size="compact-xs"
						variant="light"
						disabled={testLocked}
						onClick={() => onTestOne(selectedTest)}
					>
						Test
					</Button>
					<Button
						size="compact-xs"
						variant="light"
						disabled={testLocked}
						onClick={onTestAll}
					>
						Test All
					</Button>
					<ActionIcon
						size="sm"
						variant="subtle"
						onClick={() => setTestBarExpanded(!testBarExpanded)}
						style={{
							transition: 'transform 0.2s ease',
							transform: testBarExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
						}}
					>
						▾
					</ActionIcon>
				</Group>
			</Group>

			{/* Expanded test info */}
			<Box style={{
				overflow: 'hidden',
				maxHeight: testBarExpanded ? 200 : 0,
				transition: 'max-height 0.25s ease',
			}}>
				{test && (
					<Box px="sm" pb="xs">
						<Text size="sm" fw={600} mb={4}>
							{selectedTest + 1}. {test.name ?? `Test ${selectedTest + 1}`}
						</Text>
						{test.type === 'stdout' && (
							<Text size="xs" c="dimmed">
								Expected output: <Code>{test.expected}</Code>
							</Text>
						)}
						{test.type === 'return' && (
							<>
								<Text size="xs" c="dimmed">
									Args: <Code>{JSON.stringify(test.args)}</Code>
								</Text>
								<Text size="xs" c="dimmed">
									Expected: <Code>{test.expected}</Code>
								</Text>
							</>
						)}
						{test.type === 'state' && (
							<Text size="xs" c="dimmed">
								{test.name ?? test.expression}
							</Text>
						)}
						{result?.passed != null && (
							<Text size="xs" c={result.passed ? 'green' : 'red'} mt={2}>
								{result.passed ? 'Passed' : 'Failed'}
							</Text>
						)}
					</Box>
				)}
			</Box>
		</Box>
	);
}
