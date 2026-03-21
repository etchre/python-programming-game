import { Center, Stack, Title, Text, Card } from '@mantine/core'
import { Carousel } from '@mantine/carousel'
import { useSceneStore } from '../stores/sceneStore';
import { stages } from '../stages/stages';
import { Header } from '../components/Header';

interface StageCardProps {
  stage: number;
  name: string;
  description: string;
}

function StageCard({stage, name, description}: StageCardProps) {
  const setScene = useSceneStore((s) => s.setScene);
  const setStage = useSceneStore((s) => s.setStage);

  return (
    <Carousel.Slide>
      <Card
        withBorder
        h="100%"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setStage(stage);
          setScene('levelselect');
        }}
      >
        <Title>Stage {stage}</Title>
        <Text>{name}</Text>
        <Text>{description}</Text>
      </Card>
    </Carousel.Slide>
  )
}

export function Stages() {
  const setScene = useSceneStore((s) => s.setScene);

  return (
    <Stack h='100vh' gap={0}>
      <Header title="Stage Select" onBack={() => setScene('menu')} />
      <Center style={{ flex: 1 }}>
      <Carousel
        withIndicators
        w='50vw'
        height={300}
        slideSize='66.666%'
        slideGap="md"
        initialSlide={0}
        emblaOptions={{ align: 'center', containScroll: false }}
      >
        {stages.map((s) => (
          <StageCard key={s.id} stage={s.id} name={s.name} description={s.description} />
        ))}
      </Carousel>
    </Center>
    </Stack>
	);
}
