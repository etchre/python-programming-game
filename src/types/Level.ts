import { Test } from './Test';

export interface Level {
  id: number;
  name: string;
  description: string;
  tests: Test[];
  tasks: any[]; // TODO: replace with Task type when defined
  starterCode: string;
}
