import Phaser from 'phaser';
import { BaseScene } from './BaseScene';

export abstract class TextMatchScene extends BaseScene {
  abstract readonly targetText: string;

  private container!: Phaser.GameObjects.Container;
  private charTexts: Phaser.GameObjects.Text[] = [];
  private fontSize = 32;
  private charWidth = 0;

  onCreate() {
    this.container = this.add.container(0, 0);
    this.buildChars();
    this.handleResize();
  }

  // currently
  updateCode(code: string) {
    const firstLine = code.split('\n')[0] ?? '';
    const alignment = this.alignToTarget(firstLine);
    const strokeThickness = Math.max(1, Math.floor(this.fontSize * 0.04));

    alignment.forEach((state, i) => {
      const text = this.charTexts[i];
      if (state === 'correct') {
        text.setText(this.targetText[i]).setStyle({
          color: '#ffffff',
          stroke: '',
          strokeThickness: 0,
        });
      } else {
        // Missing — show target letter as a dashed outline
        text.setText(this.targetText[i]).setStyle({
          color: 'rgba(0,0,0,0)',
          stroke: '#6b7280',
          strokeThickness,
        });
      }
    });
  }

  /**
   * Aligns current string to target using edit distance backtracking.
   * Returns one state per target character.
   */
  private alignToTarget(current: string): ('correct' | 'missing')[] {
    const target = this.targetText;
    const m = target.length, n = current.length;

    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
      Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (target[i - 1] === current[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const result: ('correct' | 'missing')[] = [];
    let i = m, j = n;

    while (i > 0) {
      if (j > 0 && target[i - 1] === current[j - 1]) {
        result.unshift('correct');
        i--; j--;
      } else if (j > 0 && dp[i][j - 1] < dp[i - 1][j] && dp[i][j - 1] < dp[i - 1][j - 1]) {
        j--; // extra char in current, skip
      } else if (j > 0 && dp[i - 1][j - 1] <= dp[i - 1][j]) {
        result.unshift('missing'); // substitution — still wrong
        i--; j--;
      } else {
        result.unshift('missing'); // deletion
        i--;
      }
    }

    return result;
  }

  private buildChars() {
    this.container.removeAll(true);
    this.charTexts = [];

    for (const char of this.targetText) {
      const text = this.add.text(0, 0, char, {
        fontFamily: 'monospace',
        fontSize: `${this.fontSize}px`,
        color: '#ffffff',
      }).setOrigin(0, 0.5);

      this.container.add(text);
      this.charTexts.push(text);
    }

    this.charWidth = this.charTexts[0]?.width ?? this.fontSize * 0.6;
    this.layoutChars();
  }

  private layoutChars() {
    const totalWidth = this.charWidth * this.targetText.length;
    const startX = -totalWidth / 2;
    this.charTexts.forEach((text, i) => {
      text.setPosition(startX + i * this.charWidth, 0);
    });
  }

  handleResize() {
    const { width, height } = this.scale;

    const fontFromWidth = (width * 0.85) / (this.targetText.length * 0.6);
    const fontFromHeight = height * 0.35;
    this.fontSize = Math.floor(Math.min(fontFromWidth, fontFromHeight));

    this.buildChars();
    this.container.setPosition(width / 2, height / 2);
  }
}
