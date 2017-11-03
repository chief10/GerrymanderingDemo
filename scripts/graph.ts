declare var require: any;
declare type stateShapes = {
  objects: any
}

import * as d3 from 'd3';

import {
  createGridSquares,
  determineSquareTeam,
  figureBgSquarePosition,
  bootstrapDOM
} from './helpers';

import { GraphHost } from './graph-host';

import {
  IGridConfig,
  IGridSquare,
  IGridLink
} from '../types';


const config: IGridConfig = {
  width: 400,
  height: 400,
  spacing: 25,
  numOfColumns: 5,
  numOfRows: 5,
  sqHeight: 50,
  sqWidth: 50
}

let gridSquares = createGridSquares(config);



export function run() {
  bootstrapDOM();
  
  let host = new GraphHost(config);

  const container = d3.select("#gerrymandering-graph")
    .append('svg')
    .attr('class', "my-svg")
    .attr("width", config.width)
    .attr("height", config.height);

  const bg = container.append('g')
    .attr('class', "bg-square-container")
    .attr('style', `transform: translate(${config.spacing}px, ${config.spacing}px )`);

  const g = container.append('g')
    .attr('class', "square-container")
    .attr('style', `transform: translate(${config.spacing}px, ${config.spacing}px )`);


  host.updateFn = update;

  update();

  function update() {
    const squareBackground = bg.selectAll('.single-square-group')
      .data(host.groupedSquares)

    squareBackground.exit().remove()
    squareBackground.enter()
      .append('rect')
        .attr('class', (d: IGridSquare) =>  `single-square-group group-${d.group}`)
        .attr('x', (d: IGridSquare) => figureBgSquarePosition(d, host.config.spacing).x)
        .attr('y', (d: IGridSquare) => figureBgSquarePosition(d, host.config.spacing).y)
        .attr('width', (d: IGridSquare) => d.width + host.config.spacing)
        .attr('height', (d: IGridSquare) => d.height + host.config.spacing)


    const squares = g.selectAll('.single-square')
      .data(host.gridSquares)

    squares.exit().remove()
    squares.enter()
      .append('rect')
        .attr('x', (d: IGridSquare) => d.x)
        .attr('y', (d: IGridSquare) => d.y)
        .attr('width', (d: IGridSquare) => d.width)
        .attr('height', (d: IGridSquare) => d.height)
        .attr('class', (d: IGridSquare) => d.baseClasses)
        .on('click', (e) => {
          host.addCurrentSquare(e);
        })

    const links = g.selectAll('.line')
      .data(host.gridLinks)

    links.exit().remove();

    links.enter()
      .append('line')
      .attr('class', 'line')
      .style("stroke", "black")
      .attr('x1', (d: IGridLink) => d.x0)
      .attr('x2', (d: IGridLink) => d.x1)
      .attr('y1', (d: IGridLink) => d.y0)
      .attr('y2', (d: IGridLink) => d.y1)
  }
}

