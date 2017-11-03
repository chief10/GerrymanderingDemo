declare type document = Document;
declare var document: Window["document"];

import { IScoreBoard } from '../types';
let doc: Document;
if (typeof document !== "undefined") {
  doc = document;
}

export class ScoreBoard {
  state: {
    greens: {
      score: number,
      label: string,
      wastedVotes?: number
    }
    purples: {
      score: number,
      label: string,
      wastedVotes?: number
    }
  }

  anchorElem: string;
  bodyText: string;

  constructor(elem: string) {
    this.anchorElem = elem;

    this.state = {
      greens: {
        score: 0,
        label: "Greens",
        wastedVotes: 0
      },
      purples: {
        score: 0,
        label: "Purples",
        wastedVotes: 0
      }
    }

    this.render();
    this._addClickHandlers();
  }


  setState(state: any) {
    this.state = state;
    this.render();
  }

  render() {
    this.bodyText = this._createBodyText();

    // Needed to avoid error in tests.
    if (typeof doc !== "undefined") {
      let anchorElem = doc.querySelector(this.anchorElem);
      anchorElem.innerHTML = this.bodyText;

      this._addClickHandlers();
    }
  }

  getState() {
    let state = Object.assign({}, this.state);
    return state;
  }

  _createBodyText() {
    let t = `
    <div class="score-board">
        <h3> Score Board </h3>


        <table class="score-board">
          <thead>
          <th></th>
            <th>
              <div class="greens">${this.state.greens.label}</div>
            </th>
            <th>
              <div class="purples">${this.state.purples.label}</div>
            </th>
          </thead>
          <tbody>
            <tr>
              <td>Districts won</td>
              <td>${this.state.greens.score}</td>
              <td>${this.state.purples.score}</td>
            </tr>
            <tr>
              <td>Wasted Votes</td>
              <td>${this.state.greens.wastedVotes}</td>
              <td>${this.state.purples.wastedVotes}</td>
            </tr>
          </tbody>

        </table>
        <div class="score-board-controls">
          <button id="score-board-reset" class="reset">Reset Grid</button>
        </div>
      </div>
    `

    return t;
  }

  _addClickHandlers() {
    this._dispatchResetEvent();
  }

  _dispatchResetEvent() {
    let resetBtn, eevent;

    if (typeof doc !== "undefined") {
      resetBtn = doc.getElementById("score-board-reset");
      resetBtn.addEventListener("click", () => {
        eevent = new CustomEvent('gh.reset');
        doc.dispatchEvent(eevent);
      });
    }
  }



}