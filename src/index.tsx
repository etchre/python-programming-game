import { render } from 'preact';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css'
import './style.css';

import { Game, Stages, Menu, LevelSelect } from './scenes';
import { useSceneStore } from './stores/sceneStore';

const scenes = {
  'menu': Menu,
  'stages': Stages,
  'levelselect': LevelSelect,
  'game': Game
}

export function App() {
  const currentScene = useSceneStore((s) => s.scene)
  const SceneComponent = scenes[currentScene]

	return (
		<MantineProvider defaultColorScheme='dark'>
			<SceneComponent />
		</MantineProvider>
	);
}

render(<App />, document.getElementById('app'));
