import { Stage } from '../types';
import { introLevels } from './1intro/levels';
import { loopLevels } from './2loops/levels';
import { conditionalLevels } from './3conditionals/levels';

export const stages: Stage[] = [
  {id: 1, name: 'Intro', description: 'Get started with Python basics.', levels: introLevels},
  {id: 2, name: 'Loops', description: 'Repeat actions with for and while loops.', levels: loopLevels},
  {id: 3, name: 'Conditionals', description: 'Make decisions with if and else.', levels: conditionalLevels},
];
