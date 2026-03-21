import { Level } from './Level';

export interface Stage {
  id: number;
  name: string;
  description: string;
  levels: Level[];
}
