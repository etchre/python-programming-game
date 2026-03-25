import Phaser from 'phaser';

export class BaseScene extends Phaser.Scene {
  onCreate() {}

  create() {
    this.scale.on('resize', () => this.handleResize());
    this.onCreate();
  }

  handleResize() {}

  // callback that takes in the current code from the editor
  // fires on every change in the code editor
  // this is only used when the level enables this feature
  // via 'needsCodeUpdate', it needs to be set to true
  updateCode(_code: string) {}
}
