import {Lens, LensContext, LensProps} from "@phil-rice/lens";
import * as React from "react";


//These are the interfaces to describe the Game json
export interface GameData {
    next: NoughtOrCross,
    board: BoardData
}
type NoughtOrCross = "O" | "X" | ""
export interface BoardData {squares: SquareData}
type SquareData = NoughtOrCross[]
export let nextStateLens = Lens.build<GameData>('game').field('next')

/** This is a helper to get rid of the noise of  LensProps<GameDomain, GameData, T> replacing it with GameProps<T> */
export type GameProps<T> = LensProps<GameDomain, GameData, T>

export class GameDomain {
    invert(s: NoughtOrCross): NoughtOrCross {return (s === 'X' ? 'O' : 'X')};
    setSquareAndInvertNext<Main>(context: LensContext<GameDomain, GameData,NoughtOrCross>) {
        let domain = context.domain;

        let next = context.jsonFromLens(domain.nextStateLens)
        if (context.json() === '')
            context.setFromTwo(domain.nextStateLens, next, domain.invert(next))
    }

    nextStateLens: Lens<GameData, NoughtOrCross>
    constructor(nextStateLens: Lens<GameData, NoughtOrCross>) { this.nextStateLens = nextStateLens; }
}
//This is the json representation of the state of the game
export let emptyGame: GameData = {
    "next": "X",
    "board": {
        "squares": ["", "", "", "", "", "", "", "", ""]
    }
}

export function SimpleGame<Main>({context}: GameProps<GameData>) {
    return (
        <div className='game'>
            <NextMove context={context.focusOn('next')}/>
            <Board context={context.focusOn('board')}/>
        </div>)
}


export function NextMove<Main>({context}: GameProps<NoughtOrCross>) {
    let onClick = () => context.setJson('O')
    return (<a onClick={onClick}> Next Move{context.json()}</a>)
}

export function Board<Main>({context}: GameProps<BoardData>) {
    let squares = context.focusOn('squares');
    let sq = (n: number) => (<Square context={squares.withChildLens(Lens.nth(n))}/>)
    return (<div className='board'>
        <div>{sq(0)}{sq(1)}{sq(2)}</div>
        <div>{sq(3)}{sq(4)}{sq(5)}</div>
        <div>{sq(6)}{sq(7)}{sq(8)}</div>
    </div>)
}


export function Square<Main>({context}: GameProps<NoughtOrCross>) {
    return (
        <button className='square' onClick={() => context.domain.setSquareAndInvertNext(context)}>
            {context.json()}
        </button>)
}