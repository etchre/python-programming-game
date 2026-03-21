import { ComponentChildren } from 'preact';
import { Box, Stack } from '@mantine/core';

interface RightSplitProps {
	top: ComponentChildren;
	bottom: ComponentChildren;
}

export function RightSplit({ top, bottom }: RightSplitProps) {
	return (
		<Stack w="50%" gap={0}>
			<Box h="50%" style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
				{top}
			</Box>
			<Box h="50%" style={{ overflow: 'auto' }}>
				{bottom}
			</Box>
		</Stack>
	);
}
