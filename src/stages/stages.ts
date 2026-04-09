import { Stage } from '../types';
import { basicLevels } from './1basics/levels';
import { stringLevels } from './2strings/levels';
import { controlFlowLevels } from './3controlflow/levels';
import { dataStructureLevels } from './4datastructures/levels';
import { functionLevels } from './5functions/levels';

export const stages: Stage[] = [
  {id: 1, name: 'Basics', description: 'Start off with the basics of programming!', levels: basicLevels},
  {id: 2, name: 'Strings', description: 'Slice, parse, and manipulate text.', levels: stringLevels},
  {id: 3, name: 'Control Flow', description: 'Make decisions and repeat actions with loops.', levels: controlFlowLevels},
  {id: 4, name: 'Data Structures', description: 'Organize data with lists, dicts, and more.', levels: dataStructureLevels},
  {id: 5, name: 'Functions', description: 'Write reusable code with functions.', levels: functionLevels},
];
