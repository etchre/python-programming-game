// store.ts
import { create } from 'zustand';

interface SceneProps {
	scene: string;
	setScene: (scene: string) => void;
}

// defaults to the menu scene
export const useSceneStore = create<SceneProps>((set) => ({
	scene: 'menu',
	setScene: (scene: string) => set({scene}),
}));
