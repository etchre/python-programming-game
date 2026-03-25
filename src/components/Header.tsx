import { ActionIcon, Button, Group, SegmentedControl, Title, Text } from '@mantine/core';

interface HeaderProps {
	title: string;
	onBack: () => void;
	onRun?: () => void;
	onStop?: () => void;
	onNextStep?: () => void;
	onStepClick?: (step: number) => void;
	loading?: boolean;
	isPlaying?: boolean;
	speed?: string;
	onSpeedChange?: (value: string) => void;
	totalSteps?: number;
	currentStep?: number;
	completedSteps?: boolean[];
}

const speedOptions = [
	{ label: '0.25x', value: '800' },
	{ label: '0.5x', value: '400' },
  { label: '1x', value: '200' },
  { label: '2x', value: '100' },
  { label: '4x', value: '50' },
	{ label: '8x', value: '25' }
];

function StepDot({ number, completed, isCurrent, onClick }: { number: number; completed: boolean; isCurrent: boolean; onClick?: () => void }) {
	const borderColor = isCurrent ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-dark-4)';
	const styles: Record<string, any> = {
		width: 24,
		height: 24,
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: 12,
		fontWeight: 600,
		lineHeight: 1,
		cursor: onClick ? 'pointer' : 'default',
		border: `2px solid ${borderColor}`,
		backgroundColor: completed ? 'var(--mantine-color-green-7)' : 'transparent',
		color: completed ? 'white' : isCurrent ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-dark-4)',
	};

	return <div style={styles} onClick={onClick}>{number}</div>;
}

export function Header({
	title, onBack, onRun, onStop, onNextStep, onStepClick,
	loading = false, isPlaying = false,
	speed, onSpeedChange,
	totalSteps, currentStep = 0, completedSteps = [],
}: HeaderProps) {
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
				{totalSteps != null && totalSteps > 0 && (
					<Group gap={6}>
						{Array.from({ length: totalSteps }, (_, i) => {
							const unlocked = i === 0 || completedSteps[i - 1];
							return (
								<StepDot
									key={i}
									number={i + 1}
									completed={!!completedSteps[i]}
									isCurrent={i === currentStep}
									onClick={i !== currentStep && unlocked && onStepClick ? () => onStepClick(i) : undefined}
								/>
							);
						})}
					</Group>
				)}
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
				) : onNextStep ? (
					<Button color="green" onClick={onNextStep}>
						Next Step
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
