import { ComponentChildren } from 'preact';
import { Box } from '@mantine/core';

export function LeftSplit({ children }: { children: ComponentChildren }) {
	return (
		<Box w="50%" style={{ borderRight: '1px solid var(--mantine-color-dark-4)' }}>
			{children}
		</Box>
	);
}
