import { BaseScene } from './BaseScene';

export class TestScene extends BaseScene {
  protected circle!: Phaser.GameObjects.Arc;
  protected colors: Record<string, number> = {};

  onCreate() {
    const { width, height } = this.scale;
    const radius = Math.min(width, height) * 0.25;

    this.circle = this.add.circle(width / 2, height / 2, radius);
    this.circle.setStrokeStyle(3, 0xffffff);
    this.circle.setFillStyle();
  }

  handleResize() {
    const { width, height } = this.scale;
    const radius = Math.min(width, height) * 0.25;
    this.circle.setPosition(width / 2, height / 2);
    this.circle.setRadius(radius);
  }

  onPlaybackStart(levelData?: Record<string, any>) {
    this.circle.setFillStyle();
    if (levelData?.colors) {
      this.colors = levelData.colors;
    }
  }

  onEvent(action: string, args: any[]) {
    if (action === 'set_color') {
      const colorName = args[0] as string;
      const hex = this.colors[colorName];
      if (hex !== undefined) {
        this.circle.setFillStyle(hex);
      }
    }
  }

  onPlaybackEnd() {}
}
