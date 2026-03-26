import { Tabs, Text, Box, Stack, Code } from '@mantine/core';
import { ComponentChildren } from 'preact';
import { useRef, useEffect } from 'preact/hooks';
import { useGameStore } from '../stores/gameStore';
import { Test } from '../types';

interface InfoTabProps {
	value: string;
	children: ComponentChildren;
}

interface InfoPanelProps {
	description: string;
	tests: Test[];
}

function InfoHeader({ hasTests }: { hasTests: boolean }) {
	return (
		<Tabs.List>
			<Tabs.Tab value="description">Description</Tabs.Tab>
			<Tabs.Tab value="console">Console</Tabs.Tab>
			{hasTests && <Tabs.Tab value="testcases">Test cases</Tabs.Tab>}
		</Tabs.List>
	);
}

function InfoTab({ value, children }: InfoTabProps) {
	return (
		<Tabs.Panel value={value} style={{ flex: 1, overflow: 'auto' }}>
			<Box p="sm">
				{children}
			</Box>
		</Tabs.Panel>
	);
}

function ConsolePanel() {
	const consoleOutput = useGameStore((s) => s.consoleOutput);
	const consoleMessages = useGameStore((s) => s.consoleMessages);
	const endRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: 'instant' });
	}, [consoleOutput, consoleMessages]);

	return (
		<Tabs.Panel value="console" style={{ flex: 1, overflow: 'auto', backgroundColor: 'var(--mantine-color-dark-6)' }}>
			<Code block style={{ whiteSpace: 'pre-wrap', borderRadius: 0, backgroundColor: 'transparent' }}>
				{consoleOutput.length > 0
					? consoleOutput.join('\n')
					: <Text c="dimmed" size="sm">Run your code to see output here.</Text>
				}
			</Code>
			{consoleMessages.length > 0 && (
				<Box py="xs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
					{consoleMessages.map((msg, i) => (
						<Text key={i} c="dimmed" size="xs" px="sm" py={2}
							style={{ borderRadius: 999, border: '1px solid var(--mantine-color-dark-4)' }}>
							{msg}
						</Text>
					))}
				</Box>
			)}
			<div ref={endRef} />
		</Tabs.Panel>
	);
}

export function InfoPanel({ description, tests }: InfoPanelProps) {
	const activeTab = useGameStore((s) => s.activeTab);
	const setActiveTab = useGameStore((s) => s.setActiveTab);

	return (
		<Tabs value={activeTab} onChange={(v) => setActiveTab(v ?? 'description')} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			<InfoHeader hasTests={tests.length > 0} />

			<InfoTab value="description">
				<Text>{description}</Text>
			</InfoTab>

			<ConsolePanel />

			{tests.length > 0 && (
				<InfoTab value="testcases">
					<Stack gap="xs">
						{tests.map((test, i) => (
							<Box key={i}>
								<Text size="sm" fw={500}>Test {i + 1}</Text>
								<Text size="sm">Input: <Code>{test.input}</Code></Text>
								<Text size="sm">Expected: <Code>{test.expected}</Code></Text>
							</Box>
						))}
					</Stack>
				</InfoTab>
			)}
		</Tabs>
	);
}
