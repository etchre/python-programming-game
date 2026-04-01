interface BaseTest {
  name?: string;
  hidden?: boolean;
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
