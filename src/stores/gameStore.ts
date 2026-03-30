import { create } from 'zustand';

export interface TestResult {
	stdout: string[];
	messages: string[];
	error: string | null;
	passed: boolean | null; // null = not yet run
}

function emptyTestResult(): TestResult {
	return { stdout: [], messages: [], error: null, passed: null };
}

interface GameState {
	// playback
	isRunning: boolean;
	isPlaying: boolean;
	speed: string;

	// steps
	currentStep: number;
	completedSteps: boolean[];

	// tests
	testResults: TestResult[];
	selectedTest: number;
	testBarExpanded: boolean;
	testLocked: boolean;

	// info panel
	activeTab: string;

	// editor
	initialEditorCode: string;
	isProgressLoaded: boolean;

	// win screen
	showWinScreen: boolean;

	// actions
	setIsRunning: (v: boolean) => void;
	setIsPlaying: (v: boolean) => void;
	setSpeed: (v: string) => void;
	setCurrentStep: (v: number) => void;
	setCompletedSteps: (v: boolean[]) => void;
	setActiveTab: (v: string) => void;
	setInitialEditorCode: (v: string) => void;
	setIsProgressLoaded: (v: boolean) => void;
	setShowWinScreen: (v: boolean) => void;

	// test actions
	initTestResults: (count: number) => void;
	setTestResult: (index: number, result: Partial<TestResult>) => void;
	setSelectedTest: (v: number) => void;
	setTestBarExpanded: (v: boolean) => void;
	setTestLocked: (v: boolean) => void;
	resetTestResults: () => void;

	resetConsole: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
	isRunning: false,
	isPlaying: false,
	speed: '200',

	currentStep: 0,
	completedSteps: [],

	testResults: [],
	selectedTest: 0,
	testBarExpanded: true,
	testLocked: false,

	activeTab: 'description',

	initialEditorCode: '',
	isProgressLoaded: false,

	showWinScreen: false,

	setIsRunning: (v) => set({ isRunning: v }),
	setIsPlaying: (v) => set({ isPlaying: v }),
	setSpeed: (v) => set({ speed: v }),
	setCurrentStep: (v) => set({ currentStep: v }),
	setCompletedSteps: (v) => set({ completedSteps: v }),
	setActiveTab: (v) => set({ activeTab: v }),
	setInitialEditorCode: (v) => set({ initialEditorCode: v }),
	setIsProgressLoaded: (v) => set({ isProgressLoaded: v }),
	setShowWinScreen: (v) => set({ showWinScreen: v }),

	initTestResults: (count) => set({ testResults: Array.from({ length: count }, () => emptyTestResult()) }),
	setTestResult: (index, result) => {
		const results = [...get().testResults];
		if (results[index]) {
			results[index] = { ...results[index], ...result };
		}
		set({ testResults: results });
	},
	setSelectedTest: (v) => set({ selectedTest: v }),
	setTestBarExpanded: (v) => set({ testBarExpanded: v }),
	setTestLocked: (v) => set({ testLocked: v }),
	resetTestResults: () => {
		const count = get().testResults.length;
		set({ testResults: Array.from({ length: count }, () => emptyTestResult()) });
	},

	resetConsole: () => {
		const count = get().testResults.length;
		set({
			testResults: Array.from({ length: count }, () => emptyTestResult()),
			selectedTest: 0,
			testBarExpanded: true,
			testLocked: false,
			activeTab: 'description',
		});
	},
}));
