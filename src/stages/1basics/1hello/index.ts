import { Level, Test } from "../../../types"
import starterCode from './starter.py?raw'

const tests: Test[] = [
  {input: '', expected: 'Hello!'}
]

export const level: Level = {
  id: 1,
  name: 'Hello!',
  description: 'hello from the console!',
  tasks: [], //no tasks
  tests,
  starterCode
}
