import * as _ from "lodash";

import { IGridConfig, IGridSquare } from '../types';
import { GridSquare } from './grid-squares';

export function figureHeight(baseHeight: number) {
  return baseHeight/3 - baseHeight * 0.25;
}

export function bootstrapDOM() {
  if ( typeof document !== "undefined") {
    let baseElem = document.getElementById("gerrymandering-demo");
    let graph = document.createElement('div');
    let scoreboard = document.createElement('div');  

    graph.setAttribute('id', "gerrymandering-graph");
    scoreboard.setAttribute('id', "gerrymandering-scoreboard");

    baseElem.appendChild(graph)
    baseElem.appendChild(scoreboard);

  }
}

export function createGridSquares(config?: IGridConfig) {
  const grid = [];
  const { width, height, numOfColumns, numOfRows, spacing, sqHeight, sqWidth } = config;

  let x = 0;
  let y = 0;
  let index = 0;

  for( var i = 0; i < numOfRows; i++) {
    var row: any = []

    for( var j = 0; j < numOfColumns; j++) {
      
      let sq:IGridSquare = {
        height: sqWidth,
        width: sqHeight,
        x: j * sqHeight + spacing * j,
        y: i * sqWidth + spacing * i,
        index,
        name: determineSquareTeam(index),
        baseClasses: determineSquareTeam(index) + " single-square"
      };
      
      index++
      let gridSquare = new GridSquare(sq);
      row.push(gridSquare);
    }

    grid.push(row)
  }
  return _.flatten(grid);
}

/**
 * Helps determine the class that should be issued to 
 * each square.
 * 
 * @param index: Index of each square in the bunch.
 */
export function determineSquareTeam(index: number) {
  if ( index <= 9) {
    return "purples";
  } else {
    return "greens"
  }
};

/**
 * Provides the coordinates for the background squares.
 * @param square 
 * @param spacing 
 */
export function figureBgSquarePosition(square: IGridSquare, spacing: number): {x: number, y: number} {
  let x, y;
  x = square.x - (spacing / 2);
  y = square.y - (spacing / 2);
  return {x, y};
}