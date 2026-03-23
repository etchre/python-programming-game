import Phaser from 'phaser';

export class BaseScene extends Phaser.Scene {
  onCreate() {}

  create() {
    this.scale.on('resize', () => this.handleResize());
    this.onCreate();
  }

  handleResize() {}
}
