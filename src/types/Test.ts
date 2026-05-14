interface BaseTest {
  name?: string;
  hidden?: boolean;
  // Overrides level.levelData for this test only. Lets one level run user code
  // against multiple scenarios (e.g. different mazes for the same goal).
  levelData?: Record<string, any>;
}

export interface StdoutTest extends BaseTest {
  type: 'stdout';
  expected: string;
}

export interface ReturnTest extends BaseTest {
  type: 'return';
  args: any[];
  expected: string;
}

export interface StateTest extends BaseTest {
  type: 'state';
  expression: string;
}

export type Test = StdoutTest | ReturnTest | StateTest;
