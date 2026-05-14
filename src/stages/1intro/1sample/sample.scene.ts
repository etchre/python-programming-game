import { TextMatchScene } from '../../../phaser/TextMatchScene';

export default class SampleIntroScene extends TextMatchScene {
  readonly targetText = "print('hello')";

  constructor() {
    super({ key: 'SampleIntroScene' });
  }
}
