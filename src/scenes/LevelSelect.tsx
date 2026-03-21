import { Center, Stack, Title, Text, Card } from '@mantine/core'
import { useSceneStore } from '../stores/sceneStore';
import { stages } from '../stages/stages';
import { Header } from '../components/Header';

export function LevelSelect() {
  const currentStage = useSceneStore((s) => s.stage);
  const setScene = useSceneStore((s) => s.setScene);
  const setLevel = useSceneStore((s) => s.setLevel);

  const stage = stages.find((s) => s.id === currentStage);

  return (
    <Stack h='100vh' gap={0}>
      <Header title={stage?.name ?? ''} onBack={() => setScene('stages')} />
      <Stack p="md">
        {stage?.levels.map((level) => (
          <Card
            key={level.id}
            withBorder
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setLevel(level.id);
              setScene('game');
            }}
          >
            <Title order={3}>{level.name}</Title>
            <Text>{level.description}</Text>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
