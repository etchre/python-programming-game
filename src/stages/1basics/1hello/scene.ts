import Phaser from 'phaser';
import { BaseScene } from '../../../phaser/BaseScene';

const TARGET_TEXT = "print('hello!')";
const TARGET_COLORS: string[] = [
  '#61afef', '#61afef', '#61afef', '#61afef', '#61afef', // print
  '#abb2bf',                                              // (
  '#e5c07b',                                              // '
  '#98c379', '#98c379', '#98c379', '#98c379', '#98c379', '#98c379', // hello!
  '#e5c07b',                                              // '
  '#abb2bf',                                              // )
];

export class HelloScene extends BaseScene {
  private container!: Phaser.GameObjects.Container;
  private charTexts: Phaser.GameObjects.Text[] = [];
  private fontSize = 32;
  private charWidth = 0;

  constructor() {
    super({ key: 'HelloScene' });
  }

  onCreate() {
    this.container = this.add.container(0, 0);
    this.buildChars();
    this.handleResize();
  }

  updateCode(code: string) {
    const firstLine = code.split('\n')[0] ?? '';
    const alignment = this.alignToTarget(TARGET_TEXT, firstLine);
    const strokeThickness = Math.max(1, Math.floor(this.fontSize * 0.04));

    alignment.forEach((state, i) => {
      const text = this.charTexts[i];
      if (state.type === 'missing') {
        text.setText(TARGET_TEXT[i]).setAlpha(1).setStyle({
          color: 'rgba(0,0,0,0)',
          stroke: '#6b7280',
          strokeThickness,
        });
      } else if (state.type === 'correct') {
        text.setText(TARGET_TEXT[i]).setAlpha(1).setStyle({
          color: TARGET_COLORS[i],
          stroke: '',
          strokeThickness: 0,
        });
      } else {
        text.setText(state.typed).setAlpha(1).setStyle({
          color: '#e06c75',
          stroke: '',
          strokeThickness: 0,
        });
      }
    });
  }

  // Aligns current string to target using edit distance backtracking.
  // Returns one state per target character.
  private alignToTarget(target: string, current: string): ({ type: 'correct' | 'missing' } | { type: 'wrong', typed: string })[] {
    const m = target.length, n = current.length;
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
      Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (target[i-1] === current[j-1]) {
          dp[i][j] = dp[i-1][j-1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
        }
      }
    }

    const result: ({ type: 'correct' | 'missing' } | { type: 'wrong', typed: string })[] = [];
    let i = m, j = n;

    while (i > 0) {
      if (j > 0 && target[i-1] === current[j-1]) {
        result.unshift({ type: 'correct' });
        i--; j--;
      } else if (j > 0 && dp[i][j-1] < dp[i-1][j] && dp[i][j-1] < dp[i-1][j-1]) {
        // Extra character in current — skip it
        j--;
      } else if (j > 0 && dp[i-1][j-1] <= dp[i-1][j]) {
        // Substitution
        result.unshift({ type: 'wrong', typed: current[j-1] });
        i--; j--;
      } else {
        // Deletion — missing character
        result.unshift({ type: 'missing' });
        i--;
      }
    }

    return result;
  }

  private buildChars() {
    this.container.removeAll(true);
    this.charTexts = [];

    TARGET_TEXT.split('').forEach((char, i) => {
      const text = this.add.text(0, 0, char, {
        fontFamily: 'monospace',
        fontSize: `${this.fontSize}px`,
        color: TARGET_COLORS[i],
      }).setOrigin(0, 0.5);

      this.container.add(text);
      this.charTexts.push(text);
    });

    this.charWidth = this.charTexts[0]?.width ?? this.fontSize * 0.6;
    this.layoutChars();
  }

  private layoutChars() {
    const totalWidth = this.charWidth * TARGET_TEXT.length;
    const startX = -totalWidth / 2;
    this.charTexts.forEach((text, i) => {
      text.setPosition(startX + i * this.charWidth, 0);
    });
  }

  handleResize() {
    const { width, height } = this.scale;

    const fontFromWidth = (width * 0.85) / (TARGET_TEXT.length * 0.6);
    const fontFromHeight = height * 0.35;
    this.fontSize = Math.floor(Math.min(fontFromWidth, fontFromHeight));

    this.buildChars();
    this.container.setPosition(width / 2, height / 2);
  }
}
