import { useRef, useEffect } from 'preact/hooks';
import Phaser from 'phaser';
import { MutableRef } from 'preact/hooks';
import { Level } from '../types';

interface GameCanvasProps {
  level: Level;
  gameRef?: MutableRef<Phaser.Game | null>;
}

export function GameCanvas({ level, gameRef }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let game: Phaser.Game | null = null;
    let rafId: number | null = null;

    const getSize = () => {
      const rect = container.getBoundingClientRect();
      return {
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
      };
    };

    const syncGameSize = () => {
      const { width, height } = getSize();
      if (width <= 0 || height <= 0) return;

      if (!game) {
        game = new Phaser.Game({
          parent: container,
          type: Phaser.AUTO,
          backgroundColor: '#1a1a2e',
          scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width,
            height,
          },
          scene: level.phaserScene ? [level.phaserScene] : [],
        });

        if (gameRef) gameRef.current = game;
        return;
      }

      game.scale.resize(width, height);
    };

    const scheduleSync = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(syncGameSize);
    };

    const resizeObserver = new ResizeObserver(scheduleSync);
    resizeObserver.observe(container);
    scheduleSync();

    return () => {
      resizeObserver.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
      game?.destroy(true);
      if (gameRef) gameRef.current = null;
    };
  }, [level.id, level.phaserScene]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
