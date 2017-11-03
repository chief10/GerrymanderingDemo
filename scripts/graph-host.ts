import * as _ from 'lodash';
import * as chalk from 'chalk';
import { 
  IGraphHost, 
  IGridConfig,
  IGridSquare,
  IGridLink,
  IState,
  IWastedVotes 
} from '../types'

import { createGridSquares } from './helpers'
import { ScoreBoard } from './score-board';


export class GraphHost implements IGraphHost {
  gridSquares: IGridSquare[];
  gridSquareGroups: IGridLink[][] = [[]];
  gridLinks: IGridLink[] = [];
  groupedSquares: IGridSquare[] = [];
  config: IGridConfig;
  scoreBoard: ScoreBoard;
  scoreBoardState: IState;
  currentSquare: IGridSquare;
  updateFn: any;


  constructor(config: IGridConfig) {
    this.config = config;
    this._bootStrapGraph(config);
    this._addClickHandlers();
  }

  /**
   * When a user clicks on a square, that becomes the "currentSquare".
   * 
   * @param square 
   */
  addCurrentSquare(square: IGridSquare): void {
    let tempGroups, gsquares, link:IGridLink;

    if ( !this.currentSquare ) {

      this._setCurrentSquare(square);

    } else {
      
       link = {
        source: this.currentSquare.index,
        target: square.index,
      };

      link = this._figureLinkCoords(link);
      


      if ( this._checkIfLinkIsValid(link, square) ) {

        this.addGridLink(link);

        this.currentSquare = null;
        let groupLinks: IGridLink[][] = this._checkGroupOfLinks();
        let singleIndexes = this._getSquareIndexes(groupLinks);

        if ( singleIndexes ) {
           gsquares = this._collectSquares(singleIndexes);
           this.groupedSquares = this._groupSquareData(gsquares);
           this._updateScoreBoard();
           this._resetCurrentSquare();
        }

        this._updateGraph();
      } 
    }
    return;
  }

  /**
   * 
   * @param link
   */
  addGridLink(link: IGridLink) {
    this.gridLinks.push(link)
  }

  /**
   * Strings together various checks for links
   * to ensure they can be added.
   * @param link 
   */
  _checkIfLinkIsValid(link: IGridLink, square?: IGridSquare): boolean {
    if (!this._squareIsCloseEnough(this.currentSquare, square)) {
      console.log("This is not close enough")
      return false;
    }

    if ( this._checkForDuplicateLink(link) ) {
      console.log("Link is already a duplicate!");
      return false;
    } 

    if ( this._checkIfLinkIsPartOfGroup(link) ) {
      console.log("Link is already part ofadsf a group!")
      return false;
    } 

    if ( this._checkIfSquareIsLinkingToAnotherInGroup(link)) {
      console.log("This link is already part of a group");
      return false;
    }

    return true;

  }

  /**
   * Makes sure that none of the "target"
   * squares are already in a link pair.
   * 
   * This prevents people from being able to 
   * make a square with 4 links and the graph
   * from thinking it's a full group.
   * @param link 
   */
  _checkIfSquareIsLinkingToAnotherInGroup(link: IGridLink) {
    let isUnwantedTarget = false;

    if ( this.gridLinks ) {
      isUnwantedTarget = this.gridLinks.some((slink: IGridLink) => {
        return slink.source === link.target;
      });
    }

    return isUnwantedTarget;
  }

  /**
   * If the link we are trying to add includes
   * a square that is already part of a square group,
   * this should return true.
   * @param link 
   */
  _checkIfLinkIsPartOfGroup(link: IGridLink): boolean {
    let groupMatch = false;
    if ( this.gridSquareGroups.length >=1 && this.gridSquareGroups[0].length > 0 ) {
      groupMatch = this.gridSquareGroups.some((linkGroup: IGridLink[]) => {
        return linkGroup.some((links: IGridLink) => {
          return  ( 
            links.source === link.source ||
            links.target === link.source ||
            links.target === link.target
          ) 
        })
      });
    }
    return groupMatch
  }


  _groupSquareData(squares: IGridSquare[][]): IGridSquare[] {
    let squareGroups = this._delegateGroups(squares);
    return squareGroups;
  }

  _getSquareIndexes(gridLinks: IGridLink[][]): [number[]] {
    if ( !gridLinks ) return;

    let indexes: any = gridLinks.map((v) => {

      return _.chain(v)
        .flatten()
        .map((d: IGridLink) => {
          let x = {source: d.source, target: d.target}
          return _.values(x);
        })
        .flatten()
        .uniq()
        .value();
    });

    return indexes;
  };


  /**
   * Takes an array of number[] holding
   * uniq indexes for each square in each group
   * from _.getSquareIndexes();
   * 
   * 
   * @param inds 
   */
  _collectSquares(inds: [number[]]) {
    let squareGroups = inds.map((v) => {
      return v.map((b) => {
        return this.gridSquares.find((a) => {
          return a.index === b;
        });
      });
      
    });

    return squareGroups;
  }

  _updateScoreBoard() {
    let incTeam = this.groupedSquares[this.groupedSquares.length - 1].group;
    this._incrementTeamScore(incTeam);
    this._determineWastedVotes()
  }

  /**
   * Used to find the wasted votes for each district.
   * TODO: this
   */
  _determineWastedVotes():IWastedVotes {
    let arr = _.chunk(this.groupedSquares, 5);
    let wastedVotes: IWastedVotes = {
      greens: 0,
      purples: 0
    }

    arr.forEach((v: IGridSquare[]) => {
      let values = _.countBy(v, "name");

      _.forIn(values, (numVotes: number, nameLabel: string) => {
        if ( numVotes < 3) {
          wastedVotes[nameLabel] = numVotes
        }

        if ( numVotes > 3) {
          wastedVotes[nameLabel] = numVotes - 3;
        }
      })
    })

    Object.keys(wastedVotes).forEach((v: string) => {
      this.scoreBoardState[v].wastedVotes += wastedVotes[v]
    });

    this.scoreBoard.setState(this.scoreBoardState);
    return wastedVotes
  }

  /**
   * When a group a district is drawn, 
   * we want to increment the "score" for the
   * team of that district.
   */
  _incrementTeamScore(team: string) {
    if ( team !== "greens" && team !== "purples") {
      console.warn("Did not list an appropriate team")
      return;
    } else {
      this.scoreBoardState[team].score++;
      this.scoreBoard.setState(this.scoreBoardState);
    }
  }

  /**
   * Determines which group should be provided 
   * to each square, based on the prevelence of
   * that group in their square group.
   */
  _delegateGroups(squareGroups: IGridSquare[][]): IGridSquare[]|any[] {

    let groups = _(squareGroups)
      .map((v) => {
        let groupName: string, elems, n;

        elems = _(v)
          .groupBy("name")
          .value();

        n = Object.keys(elems);

        if (elems[n[0]].length > 2) {
          groupName = n[0];
        } else {
          groupName = n[1];
        }

        elems = v.map((a) => {
          a.group = groupName
          return a;
        });

        return elems
      })
      .flatten()
      .value();
      
      return groups;
  }

  /**
   * Used to provide link coordinates for 
   * the link items.
   * 
   * TODO: Need to also make sure orientation is correct.
   */
  _figureLinkCoords(link: IGridLink) {
    var sourceSquare = this.gridSquares.find((s) => s.index === link.source), 
      targetSquare   = this.gridSquares.find((s) => s.index === link.target),
      x0, x1, y0, y1;

      // Will for sure need to elaborate on this logic.
      if ( !sourceSquare.isAvailable || !targetSquare.isAvailable ) {
        return;
      }

      if ( sourceSquare.x === targetSquare.x) {
        x0 = sourceSquare.x + (sourceSquare.height / 2); x1 = x0;
      } else {
        if ( sourceSquare.x < targetSquare.x) {
          x0 = sourceSquare.x + (sourceSquare.width);
          x1 = targetSquare.x;
        } else {
          // If sourceSquare.x > targetSquare.x
          x0 = sourceSquare.x;
          x1 = targetSquare.x + targetSquare.width;
        }
      }

      // Ahh shit. The y values are inverse.
      if (sourceSquare.y === targetSquare.y) {
        y0 = sourceSquare.y + (sourceSquare.height/2); y1 = y0;
      } else {
        // If source is higher than target
        if ( sourceSquare.y < targetSquare.y) {
          y0 = sourceSquare.y + targetSquare.height;
          y1 = targetSquare.y; 
        } else {
          // If the source is lower than the target
          y0 = sourceSquare.y 
          y1 = targetSquare.y + sourceSquare.height;
        }
      }

      link = Object.assign({}, link, {x0, x1, y0, y1});
      
      return link;
  }

  /**
   * Is used to make sure we do not have
   * more than one grid link. Returns true
   * if there is another duplicate link.
   * 
   * @param link: is a potential new link between
   * grid squares. 
   */
  _checkForDuplicateLink(link: IGridLink): boolean {
    const check = _.find(this.gridLinks, (slink: IGridLink) => {
      let v1 = _.valuesIn(link).sort();
      let v2 = _.valuesIn(slink).sort();

        return _.isEqual(v1, v2);
    });

    return check ? true : false;
  }

  /**
   * @param sourceSquare 
   * @param targetSquare 
   */
  _squareIsCloseEnough(sourceSquare: IGridSquare, targetSquare:IGridSquare) {
    var xgood, ygood, maxdiff = this.config.sqHeight + this.config.spacing;
    
    if ( sourceSquare.x === targetSquare.x ) {
      xgood = true;
      if ( Math.abs(sourceSquare.y - targetSquare.y) === maxdiff) {
        ygood = true;
      } else {
        return;
      }
    } else {
      if ( sourceSquare.y === targetSquare.y ) {
        ygood = true;
        if ( Math.abs(sourceSquare.x - targetSquare.x) === maxdiff) {
          xgood = true;
        } else {
          return;
        }
      }
    } 

    return ( xgood && ygood );
  }


  /**
   * The purpose of this is to have an array(s) of 
   * unique indexes pointing to the squares that are part
   * of that group. For instance it could be [[0,1,2,3,4], [5,6,7,8,9]].
   * 
   * From here, we will want to grab the actual square each element represents,
   * and add a identifier to it to determine who "won" that district.
   * That identifier will likely exist on the `group` property
   * for each GridSquare.
   * 
   * Once we have that identified, we can have d3 render the background
   * for those squares to demonstrate who the spoils of that
   * "district" go to.
   * 
   */
  _checkGroupOfLinks(): IGridLink[][] {
    let group1;

    if ( this.gridLinks && this.gridLinks.length % 4 === 0) {
      if ( this.gridLinks.length === 4 ) {
        this.gridSquareGroups[0].push(...this.gridLinks);
        group1 = this.gridSquareGroups;
      } else {
        group1 = [..._.flatten(this.gridSquareGroups), ...this.gridLinks];
        group1 = _.uniqWith(group1, _.isEqual);
        group1 = _.chunk(group1, 4);
        this.gridSquareGroups = group1
      }

      return group1;
    }
  }

  _updateGraph() {
    this.updateFn();
  }

  _resetCurrentSquare() {
    this.currentSquare = null;
  }

  /**
   * Sets the new square but first checks to make sure
   * the square is not part of a square group.
   * @param newSquare 
   */
  _setCurrentSquare(newSquare: IGridSquare) {
    let currSquare:boolean;

    if ( !this.gridSquareGroups ) {
      this.currentSquare = newSquare;
    } else {
      currSquare = this.gridSquareGroups.some((sqgroup: IGridLink[]) => {
        return sqgroup.some((link: IGridLink) => {
          return ( 
            link.source === newSquare.index ||
            link.target === newSquare.index
           );
        })
      });

      if ( !currSquare ) {
        this.currentSquare = newSquare;
      }
    }
  }

  _addClickHandlers() {
    this._resetGraph();
  }

  _bootStrapGraph(config: IGridConfig) {
    this.gridSquares = createGridSquares(config);
    this.scoreBoard = new ScoreBoard("#gerrymandering-scoreboard");
    this.scoreBoardState = this.scoreBoard.getState();
  }

  _resetGraph() {
    if ( typeof document !== "undefined") {
      document.addEventListener("gh.reset", (e) => {
        this._bootStrapGraph(this.config);
        this.gridLinks = [];
        this.groupedSquares = [];
        this.gridSquareGroups = [[]];
        this.currentSquare = null;
        this._updateGraph();
      })
    }
  }
  


}
