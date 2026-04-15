import { vi } from 'vitest';

// Mock Phaser for jsdom tests — Phaser's CJS bundle unconditionally requires
// 'phaser3spectorjs' which doesn't exist, and probes canvas features.
// Our tests only need level data, not a working Phaser runtime.
// vi.mock is hoisted to the top level regardless, so the conditional is just
// for readability — vitest will only apply it when phaser is imported.
vi.mock('phaser', () => {
  class Scene {
    scale = { on: () => {} };
    add = {
      text: () => ({ setOrigin: () => {} }),
      circle: () => ({ setStrokeStyle: () => {}, setFillStyle: () => {} }),
    };
    constructor(_config?: any) {}
    create() {}
  }
  return {
    default: { Scene },
    Scene,
  };
});
