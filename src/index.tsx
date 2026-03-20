import { render } from 'preact';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import './style.css';

import { Game, Levels, Menu } from './scenes';
import { useSceneStore } from './stores/sceneStore';

const scenes = {
  'menu': Menu,
  'levels': Levels,
  'game': Game
}

export function App() {
  const currentScene = useSceneStore((s) => s.scene)
  const SceneComponent = scenes[currentScene]

	return (
		<MantineProvider>
			<SceneComponent />
		</MantineProvider>
	);
}

render(<App />, document.getElementById('app'));
