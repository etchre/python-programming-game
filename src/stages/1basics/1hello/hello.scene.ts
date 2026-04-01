import { TextMatchScene } from '../../../phaser/TextMatchScene';

export default class HelloScene extends TextMatchScene {
  readonly targetText = "print('hello!')";

  constructor() {
    super({ key: 'HelloScene' });
  }

  // onCreate() {
  //   super.onCreate();
  //   this.add.text(100, 100, 'extra!', { color: '#ffffff' });
  // }
}
