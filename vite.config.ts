/// <reference types="vitest" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import gameData from './data/game.json';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
	base: `/staticGames/${gameData['game-id']}/`,
	test: {
		include: ['src/**/*.test.ts'],
		setupFiles: ['src/test/setup.ts'],
	},
});
