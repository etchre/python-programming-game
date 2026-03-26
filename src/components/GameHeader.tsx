import { Button, Group, SegmentedControl } from '@mantine/core';
import { useGameStore } from '../stores/gameStore';
import { Header } from './Header';

interface GameHeaderProps {
	title: string;
	onBack: () => void;
	onRun: () => void;
	onStop: () => void;
	onNextStep?: () => void;
	onStepClick?: (step: number) => void;
	totalSteps?: number;
	onResetLevel: () => void;
	onResetAll: () => void;
}

const speedOptions = [
	{ label: '0.25x', value: '800' },
	{ label: '0.5x', value: '400' },
	{ label: '1x', value: '200' },
	{ label: '2x', value: '100' },
	{ label: '4x', value: '50' },
	{ label: '8x', value: '25' },
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

function StepDots({ totalSteps, onStepClick }: { totalSteps: number; onStepClick?: (step: number) => void }) {
	const currentStep = useGameStore((s) => s.currentStep);
	const completedSteps = useGameStore((s) => s.completedSteps);

	return (
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
	);
}

export function GameHeader({
	title, onBack, onRun, onStop, onNextStep, onStepClick,
	totalSteps, onResetLevel, onResetAll,
}: GameHeaderProps) {
	const isRunning = useGameStore((s) => s.isRunning);
	const isPlaying = useGameStore((s) => s.isPlaying);
	const speed = useGameStore((s) => s.speed);
	const setSpeed = useGameStore((s) => s.setSpeed);

	return (
		<Header title={title} onBack={onBack}>
			<Group>
				{totalSteps != null && totalSteps > 0 && (
					<StepDots totalSteps={totalSteps} onStepClick={onStepClick} />
				)}
			</Group>
			<Group>
				<Button size="xs" variant="light" color="orange" onClick={onResetLevel}>
					Reset Level
				</Button>
				<Button size="xs" variant="light" color="red" onClick={onResetAll}>
					Reset All
				</Button>
				<SegmentedControl
					size="xs"
					data={speedOptions}
					value={speed}
					onChange={setSpeed}
				/>
				{isPlaying ? (
					<Button color="red" onClick={onStop}>
						Stop
					</Button>
				) : onNextStep ? (
					<Button color="green" onClick={onNextStep}>
						Next Step
					</Button>
				) : (
					<Button onClick={onRun} disabled={isRunning} loading={isRunning}>
						Run
					</Button>
				)}
			</Group>
		</Header>
	);
}
