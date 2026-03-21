// store.ts
import { create } from 'zustand';

interface SceneProps {
  scene: string;
  stage: number;
  level: number;
  setScene: (scene: string) => void;
  setStage: (stage: number) => void;
  setLevel: (level: number) => void;
}

// defaults to the menu scene
export const useSceneStore = create<SceneProps>((set) => ({
  scene: 'menu',
  stage: 1,
	level: 1,
  setScene: (scene: string) => set({scene}),
  setStage: (stage: number) => set({stage}),
	setLevel: (level: number) => set({level})
}));
