import { ActionIcon, Button, Group, SegmentedControl, Title } from '@mantine/core';

interface HeaderProps {
	title: string;
	onBack: () => void;
	onRun?: () => void;
	onStop?: () => void;
	loading?: boolean;
	isPlaying?: boolean;
	speed?: string;
	onSpeedChange?: (value: string) => void;
}

const speedOptions = [
	{ label: '0.25x', value: '800' },
	{ label: '0.5x', value: '400' },
  { label: '1x', value: '200' },
  { label: '2x', value: '100' },
  { label: '4x', value: '50' },
	{ label: '8x', value: '25' }
];

export function Header({ title, onBack, onRun, onStop, loading = false, isPlaying = false, speed, onSpeedChange }: HeaderProps) {
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
			<Group>
				{onSpeedChange && (
					<SegmentedControl
						size="xs"
						data={speedOptions}
						value={speed}
						onChange={onSpeedChange}
					/>
				)}
				{isPlaying ? (
					<Button color="red" onClick={onStop}>
						Stop
					</Button>
				) : onRun ? (
					<Button onClick={onRun} disabled={loading} loading={loading}>
						Run
					</Button>
				) : null}
			</Group>
		</Group>
	);
}
