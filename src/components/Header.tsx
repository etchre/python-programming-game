import { ActionIcon, Button, Group, Title } from '@mantine/core';

interface HeaderProps {
	title: string;
	onBack: () => void;
	onRun?: () => void;
}

export function Header({ title, onBack, onRun }: HeaderProps) {
	return (
		<Group
			h={50}
			px="md"
			justify="space-between"
			style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
		>
			<Group>
				<ActionIcon variant="subtle" onClick={onBack}>&lt;</ActionIcon>
				<Title order={4}>{title}</Title>
			</Group>
			{onRun && <Button onClick={onRun}>Run</Button>}
		</Group>
	);
}
