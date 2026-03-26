import { ActionIcon, Group, Title } from '@mantine/core';
import { ComponentChildren } from 'preact';

interface HeaderProps {
	title: string;
	onBack: () => void;
	children?: ComponentChildren;
}

export function Header({ title, onBack, children }: HeaderProps) {
	return (
		<Group
			h={50}
			px="md"
			gap="md"
			wrap="nowrap"
			style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
		>
			<Group wrap="nowrap">
				<ActionIcon variant="subtle" onClick={onBack}>&lt;</ActionIcon>
				<Title order={4}>{title}</Title>
			</Group>
			{children && (
				<Group justify="space-between" style={{ flex: 1 }}>
					{children}
				</Group>
			)}
		</Group>
	);
}
