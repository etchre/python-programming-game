import { BaseScene } from './BaseScene';

export class PlaceholderScene extends BaseScene {
  private label!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PlaceholderScene' });
  }

  onCreate() {
    const { width, height } = this.scale;
    this.label = this.add.text(width / 2, height / 2, 'No preview for this level', {
      color: '#888888',
      fontSize: '16px',
      fontFamily: 'monospace',
    });
    this.label.setOrigin(0.5);
  }

  handleResize() {
    const { width, height } = this.scale;
    this.label.setPosition(width / 2, height / 2);
  }
}
