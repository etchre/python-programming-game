import { ActionIcon, Button, Group, Title } from '@mantine/core';

interface HeaderProps {
	title: string;
	onBack: () => void;
	showRun?: boolean;
}

export function Header({ title, onBack, showRun = false }: HeaderProps) {
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
			{showRun && <Button onClick={() => {}}>Run</Button>}
		</Group>
	);
}
