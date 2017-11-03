/**
 * Maybe add a wasted vote property?
 */
export interface IScoreBoard {
  state: {
    greens: {
      score: number,
      label: string
    },
    purples: {
      score: number,
      label: string
    }
  }
}

export interface IState {
  greens: {
    score?: number,
    label?: string,
    wastedVotes?:  number
  },
  purples: {
    score?: number,
    label?: string,
    wastedVotes?: number
  },
  [propName: string]: any  
}

export interface IWastedVotes {
  greens: number,
  purples: number,
  [propName: string]: any
}