import { Tabs, Text, Box, Stack, Code } from '@mantine/core';
import { ComponentChildren } from 'preact';
import { Test } from '../types';

interface InfoTabProps {
	value: string;
	children: ComponentChildren;
}

interface InfoPanelProps {
	description: string;
	tests: Test[];
	consoleOutput: string[];
	activeTab: string;
	onTabChange: (tab: string) => void;
}

function InfoHeader() {
	return (
		<Tabs.List>
			<Tabs.Tab value="description">Description</Tabs.Tab>
      <Tabs.Tab value="console">Console</Tabs.Tab>
			<Tabs.Tab value="testcases">Test cases</Tabs.Tab>
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

export function InfoPanel({ description, tests, consoleOutput, activeTab, onTabChange }: InfoPanelProps) {
	return (
		<Tabs value={activeTab} onChange={(v) => onTabChange(v ?? 'description')} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
			<InfoHeader />

			<InfoTab value="description">
				<Text>{description}</Text>
			</InfoTab>

			<Tabs.Panel value="console" style={{ flex: 1, overflow: 'auto' }}>
				<Code block style={{ whiteSpace: 'pre-wrap', minHeight: '100%', borderRadius: 0 }}>
					{consoleOutput.length > 0
						? consoleOutput.join('\n')
						: <Text c="dimmed" size="sm">Run your code to see output here.</Text>
					}
				</Code>
			</Tabs.Panel>

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
		</Tabs>
	);
}
