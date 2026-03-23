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
    if (!containerRef.current) return;

    const game = new Phaser.Game({
      parent: containerRef.current,
      type: Phaser.AUTO,
      backgroundColor: '#1a1a2e',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%',
      },
      scene: [level.phaserScene],
    });

    if (gameRef) gameRef.current = game;

    return () => {
      game.destroy(true);
      if (gameRef) gameRef.current = null;
    };
  }, [level.id]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
