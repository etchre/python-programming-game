import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import gameData from './data/game.json';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
	base: `/games/${gameData['game-id']}/`,
});
