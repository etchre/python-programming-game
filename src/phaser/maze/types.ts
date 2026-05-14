// Grid is one string per row; equal lengths required.
// Chars: '.' empty, '#' wall, 'S' robot start, 'G' goal. Out-of-bounds = wall.
export type MazeGrid = string[];

export interface MazeData {
  grid: MazeGrid;
}
