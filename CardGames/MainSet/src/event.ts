/*
Things that need events:

player request
   send name,  get nothing back, just wait for game start
game start
   returns array mapping player names to ids
Person Moved card(s) from to
// Default add method
   playerId
   toFieldId
   cardId
Person Flipped card
   playerId
   cardId
person shuffled deck
   playerId
   fieldId
   deckOrder number[] // array of card ids

*/

/** Need this because in typescript class names can be changed at transpilation time. */
export enum EventType {
    PlayerRequestEvent,
    GameStartEvent,
    CardsMovedEvent,
    CardFlippedEvent,
    DeckShuffledEvent
}

export abstract class GameEvent {
    constructor(
        public type : EventType
    ) {
    }
}

export class PlayerRequestEvent extends GameEvent {
    constructor(
        public name : string,
        public machineId : number
    ) {
        super(EventType.PlayerRequestEvent)
    }
}
export class GameStartEvent extends GameEvent {
    constructor(
        public machineIds : number[]
    ) {
        super(EventType.GameStartEvent)
    }

}
export class CardsMovedEvent extends GameEvent {
    constructor(
        public playerId : number,
        public fieldToId: number,
        public cardIds: number[]
    ) {
        super(EventType.CardsMovedEvent)
    }

}
export class CardFlippedEvent extends GameEvent {
    constructor(
        public playerId : number,
        public cardId: number,
        public faceUp: boolean
    ) {
        super(EventType.CardFlippedEvent)
    }

}

export class DeckShuffledEvent extends GameEvent {
    constructor(
        public playerId : number,
        public fieldId: number,
        public cardOrder: number[]
    ) {
        super(EventType.DeckShuffledEvent)
    }

}
