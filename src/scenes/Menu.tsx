import { Button, Center, Stack, Title } from '@mantine/core'
import { useSceneStore } from '../stores/sceneStore';

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
      </Stack>
		</Center>
	);
}
