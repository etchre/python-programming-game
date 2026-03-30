import { Button, Stack, Text, Title } from '@mantine/core';

// ── Styles (easy to swap/extend) ──

const overlayStyles: Record<string, any> = {
	position: 'absolute',
	inset: 0,
	zIndex: 100,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	backdropFilter: 'blur(6px)',
	backgroundColor: 'rgba(0, 0, 0, 0.5)',
};

const cardStyles: Record<string, any> = {
	backgroundColor: 'var(--mantine-color-dark-7)',
	border: '1px solid var(--mantine-color-dark-4)',
	borderRadius: 12,
	padding: 32,
	textAlign: 'center',
	minWidth: 300,
};

const trophyStyles: Record<string, any> = {
	fontSize: 64,
	lineHeight: 1,
	marginBottom: 8,
};

// ── Component ──

interface WinScreenProps {
	hasNextStep: boolean;
	onStay: () => void;
	onNextStep: () => void;
	onNextLevel: () => void;
	onLevelSelect: () => void;
}

export function WinScreen({ hasNextStep, onStay, onNextStep, onNextLevel, onLevelSelect }: WinScreenProps) {
	return (
		<div style={overlayStyles}>
			<div style={cardStyles}>
				<Stack align="center" gap="md">
					<div style={trophyStyles}>
						🏆
					</div>
					<Title order={2} c="yellow">Level Complete!</Title>
					<Text c="dimmed" size="sm">All tests passed.</Text>
					<Stack gap="xs" w="100%">
						<Button variant="light" onClick={onStay}>
							Stay Here
						</Button>
						{hasNextStep ? (
							<Button color="teal" onClick={onNextStep}>
								Next Step
							</Button>
						) : (
							<Button color="teal" onClick={onNextLevel}>
								Next Level
							</Button>
						)}
						<Button variant="subtle" c="dimmed" onClick={onLevelSelect}>
							Level Select
						</Button>
					</Stack>
				</Stack>
			</div>
		</div>
	);
}
