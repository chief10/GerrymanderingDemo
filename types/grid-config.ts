export interface IGridConfig {
  spacing?: number,
  width?: number,
  height?: number,
  numOfColumns?: number,
  numOfRows?: number,
  sqHeight?: number,
  sqWidth?: number
}

/**
 * Used for implementing the individual grid squares.
 */
export interface IGridSquare {
  height: number;
  width: number,
  index: number,
  x: number,
  y: number,
  name?: string,
  baseClasses?: string,
  isAvailable?: boolean,
  group?: string
}

/**
 * Describes the over all object holding the state
 * of the graph overall.
 */
export interface IGraphHost {
  gridSquares: IGridSquare[]
  config: IGridConfig,
  updateFn?: any,
  gridSquareGroups: any[]
};

export interface IGridLink {
  source?: number,
  target?: number,
  x0?: number,
  x1?: number,
  y0?: number,
  y1?: number
}
