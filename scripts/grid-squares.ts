import { IGridSquare } from '../types';

export class GridSquare implements IGridSquare {
  width: number;
  height: number;
  index: number;
  x: number;
  y: number;
  baseClasses: string;
  group?: string;
  /**
   * Needed for when the squares are grouped up.
   * If the square is not available, no new
   * lines can be drawn to it.
   */
  isAvailable: boolean = true; 

  constructor(squareConfig: IGridSquare) {
    Object.assign(this, squareConfig);

  }
}