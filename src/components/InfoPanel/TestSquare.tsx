import { useState, useRef, useEffect } from 'preact/hooks';

export const testSquareStyles = {
	base: {
		width: 28,
		height: 28,
		borderRadius: 4,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: 12,
		fontWeight: 600,
		cursor: 'pointer',
		border: '2px solid var(--mantine-color-dark-4)',
		backgroundColor: 'transparent',
		color: 'var(--mantine-color-dark-2)',
		transition: 'background-color 0.8s ease, border-color 0.3s ease, color 0.3s ease',
	} as Record<string, any>,
	selected: {
		borderColor: 'var(--mantine-color-blue-5)',
		color: 'var(--mantine-color-blue-5)',
	},
	passed: {
		backgroundColor: 'var(--mantine-color-green-7)',
		color: 'white',
	},
	failed: {
		backgroundColor: 'var(--mantine-color-red-7)',
		color: 'white',
	},
	locked: {
		cursor: 'not-allowed',
		opacity: 0.6,
	},
};

interface TestSquareProps {
	number: number;
	isSelected: boolean;
	passed: boolean | null;
	locked: boolean;
	onClick: () => void;
}

export function TestSquare({ number, isSelected, passed, locked, onClick }: TestSquareProps) {
	const [flashFail, setFlashFail] = useState(false);
	const prevPassed = useRef<boolean | null>(null);

	useEffect(() => {
		if (passed === false && prevPassed.current !== false) {
			setFlashFail(true);
			const timer = setTimeout(() => setFlashFail(false), 1000);
			return () => clearTimeout(timer);
		}
		prevPassed.current = passed;
	}, [passed]);

	const style = {
		...testSquareStyles.base,
		...(isSelected ? testSquareStyles.selected : {}),
		...(passed === true ? testSquareStyles.passed : {}),
		...(flashFail ? testSquareStyles.failed : {}),
		...(locked ? testSquareStyles.locked : {}),
	};

	return (
		<div style={style} onClick={locked ? undefined : onClick}>
			{number}
		</div>
	);
}
