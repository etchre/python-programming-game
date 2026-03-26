import { create } from 'zustand';

interface GameState {
	// playback
	isRunning: boolean;
	isPlaying: boolean;
	speed: string;

	// steps
	currentStep: number;
	completedSteps: boolean[];

	// console
	consoleOutput: string[];
	consoleMessages: string[];

	// info panel
	activeTab: string;

	// editor
	initialEditorCode: string;
	isProgressLoaded: boolean;

	// actions
	setIsRunning: (v: boolean) => void;
	setIsPlaying: (v: boolean) => void;
	setSpeed: (v: string) => void;
	setCurrentStep: (v: number) => void;
	setCompletedSteps: (v: boolean[]) => void;
	setConsoleOutput: (v: string[]) => void;
	setConsoleMessages: (v: string[]) => void;
	setActiveTab: (v: string) => void;
	setInitialEditorCode: (v: string) => void;
	setIsProgressLoaded: (v: boolean) => void;
	resetConsole: () => void;
}

export const useGameStore = create<GameState>((set) => ({
	isRunning: false,
	isPlaying: false,
	speed: '200',

	currentStep: 0,
	completedSteps: [],

	consoleOutput: [],
	consoleMessages: [],

	activeTab: 'description',

	initialEditorCode: '',
	isProgressLoaded: false,

	setIsRunning: (v) => set({ isRunning: v }),
	setIsPlaying: (v) => set({ isPlaying: v }),
	setSpeed: (v) => set({ speed: v }),
	setCurrentStep: (v) => set({ currentStep: v }),
	setCompletedSteps: (v) => set({ completedSteps: v }),
	setConsoleOutput: (v) => set({ consoleOutput: v }),
	setConsoleMessages: (v) => set({ consoleMessages: v }),
	setActiveTab: (v) => set({ activeTab: v }),
	setInitialEditorCode: (v) => set({ initialEditorCode: v }),
	setIsProgressLoaded: (v) => set({ isProgressLoaded: v }),
	resetConsole: () => set({ consoleOutput: [], consoleMessages: [], activeTab: 'description' }),
}));
