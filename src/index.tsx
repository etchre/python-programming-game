import { render } from 'preact';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import './style.css';

export function App() {
	return (
		<MantineProvider>
			<h1>Micromouse</h1>
		</MantineProvider>
	);
}

render(<App />, document.getElementById('app'));
