import Phaser from 'phaser';
import { BaseScene } from '../BaseScene';
import type { MazeData, MazeGrid } from './types';

const COLOR_BG_GRID = 0x2a2a3e;
const COLOR_WALL = 0x4a4a5e;
const COLOR_GOAL = 0x22aa55;
const COLOR_ROBOT = 0xffffff;

const MOVE_DURATION = 120;
const BUMP_DURATION = 150; // total, including the return trip

export class MazeScene extends BaseScene {
  private grid: MazeGrid = [];
  private rows = 0;
  private cols = 0;
  private start: [number, number] = [0, 0];

  private cellSize = 0;
  private originX = 0;
  private originY = 0;

  private gridGraphics?: Phaser.GameObjects.Graphics;
  private robot?: Phaser.GameObjects.Arc;

  constructor() {
    super({ key: 'MazeScene' });
  }

  // The maze is defined by per-test (or per-level) levelData, which arrives via
  // onPlaybackStart — not at scene-create time. So the canvas is empty until the
  // user runs a test; after that the maze stays visible.
  onPlaybackStart(levelData?: Record<string, any>) {
    const data = levelData as MazeData | undefined;
    if (!data?.grid?.length) return;
    this.setGrid(data.grid);
  }

  handleResize() {
    if (this.rows > 0) this.rebuild();
  }

  onEvent(action: string, args: any[]) {
    if (action === 'robot_move') {
      const [r, c] = args as [number, number];
      this.tweenRobotTo(r, c);
    } else if (action === 'robot_bump') {
      const [dr, dc] = args as [number, number];
      this.bumpRobot(dr, dc);
    }
  }

  private setGrid(grid: MazeGrid) {
    this.grid = grid;
    this.rows = grid.length;
    this.cols = grid[0]?.length ?? 0;

    this.start = [0, 0];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === 'S') this.start = [r, c];
      }
    }

    this.rebuild();
  }

  private rebuild() {
    this.tweens.killTweensOf(this.robot!);
    this.gridGraphics?.destroy();
    this.robot?.destroy();

    const { width, height } = this.scale;
    const padding = 16;
    const availW = width - padding * 2;
    const availH = height - padding * 2;
    this.cellSize = Math.max(8, Math.floor(Math.min(availW / this.cols, availH / this.rows)));
    const totalW = this.cellSize * this.cols;
    const totalH = this.cellSize * this.rows;
    this.originX = Math.floor((width - totalW) / 2);
    this.originY = Math.floor((height - totalH) / 2);

    const g = this.add.graphics();
    this.gridGraphics = g;

    // goal fills (drawn before walls so walls overlap if grid ever encodes both)
    g.fillStyle(COLOR_GOAL);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === 'G') {
          g.fillRect(
            this.originX + c * this.cellSize + 3,
            this.originY + r * this.cellSize + 3,
            this.cellSize - 6,
            this.cellSize - 6,
          );
        }
      }
    }

    // walls
    g.fillStyle(COLOR_WALL);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === '#') {
          g.fillRect(
            this.originX + c * this.cellSize,
            this.originY + r * this.cellSize,
            this.cellSize,
            this.cellSize,
          );
        }
      }
    }

    // grid lines (subtle)
    g.lineStyle(1, COLOR_BG_GRID, 1);
    for (let r = 0; r <= this.rows; r++) {
      g.lineBetween(
        this.originX, this.originY + r * this.cellSize,
        this.originX + totalW, this.originY + r * this.cellSize,
      );
    }
    for (let c = 0; c <= this.cols; c++) {
      g.lineBetween(
        this.originX + c * this.cellSize, this.originY,
        this.originX + c * this.cellSize, this.originY + totalH,
      );
    }

    // robot at start
    const [sr, sc] = this.start;
    const { x, y } = this.cellCenter(sr, sc);
    this.robot = this.add.circle(x, y, this.cellSize * 0.3, COLOR_ROBOT);
  }

  private cellCenter(r: number, c: number) {
    return {
      x: this.originX + c * this.cellSize + this.cellSize / 2,
      y: this.originY + r * this.cellSize + this.cellSize / 2,
    };
  }

  private tweenRobotTo(r: number, c: number) {
    if (!this.robot) return;
    const { x, y } = this.cellCenter(r, c);
    this.tweens.add({
      targets: this.robot,
      x, y,
      duration: MOVE_DURATION,
      ease: 'Cubic.easeOut',
    });
  }

  private bumpRobot(dr: number, dc: number) {
    if (!this.robot) return;
    const offset = this.cellSize * 0.3;
    const baseX = this.robot.x;
    const baseY = this.robot.y;
    this.tweens.add({
      targets: this.robot,
      x: baseX + dc * offset,
      y: baseY + dr * offset,
      duration: BUMP_DURATION / 2,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }
}
