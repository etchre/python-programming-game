import { Box, Code, Text } from '@mantine/core';
import { useRef, useEffect } from 'preact/hooks';
import type { TestResult } from '../../stores/gameStore';

interface ConsoleOutputProps {
	result: TestResult | undefined;
}

export function ConsoleOutput({ result }: ConsoleOutputProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container || !result) return;

		const hasOutput =
			result.stdout.length > 0 ||
			!!result.error ||
			(result.messages?.length ?? 0) > 0;

		if (!hasOutput) return;

		container.scrollTop = container.scrollHeight;
	}, [result?.stdout, result?.messages, result?.error]);

	return (
		<Box
			ref={containerRef}
			style={{ flex: 1, overflow: 'auto', backgroundColor: 'var(--mantine-color-dark-6)' }}
		>
			<Code block style={{ whiteSpace: 'pre-wrap', borderRadius: 0, backgroundColor: 'transparent' }}>
				{result && result.stdout.length > 0
					? result.stdout.join('\n')
					: !result?.error && <Text c="dimmed" size="sm">Run a test to see output here.</Text>
				}
			</Code>
			{result?.error && (
				<Code block c="red" style={{ whiteSpace: 'pre-wrap', borderRadius: 0, backgroundColor: 'transparent' }}>
					{result.error}
				</Code>
			)}
			{result?.messages && result.messages.length > 0 && (
				<Box py="xs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
					{result.messages.map((msg, i) => (
						<Text key={i} c="dimmed" size="xs" px="sm" py={2}
							style={{ borderRadius: 999, border: '1px solid var(--mantine-color-dark-4)' }}>
							{msg}
						</Text>
					))}
				</Box>
			)}
		</Box>
	);
}
