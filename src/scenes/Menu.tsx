import { Button, Center, Stack, Title } from '@mantine/core'
import { useSceneStore } from '../stores/sceneStore';
import { resetAllProgress } from '../progress';

export function Menu() {
  const setScene = useSceneStore((s) => s.setScene)

	return (
    <Center h='100vh'>
      <Stack>
        <Title order={1} size='3rem'>
          micromouse
        </Title>
        <Button size='lg' onClick={() => setScene('stages')}>
          start
        </Button>
        <Button size='xs' variant='light' color='red' onClick={() => resetAllProgress()}>
          Reset All Progress
        </Button>
      </Stack>
		</Center>
	);
}
