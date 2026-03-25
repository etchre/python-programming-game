import { ComponentChildren } from 'preact';
import { Box, Stack } from '@mantine/core';

interface RightSplitProps {
	top: ComponentChildren;
	bottom: ComponentChildren;
}

export function RightSplit({ top, bottom }: RightSplitProps) {
	return (
		<Stack w="50%" gap={0} h="100%">
			<Box style={{ flex: 1, minHeight: 0, borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
				{top}
			</Box>
			<Box style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
				{bottom}
			</Box>
		</Stack>
	);
}
