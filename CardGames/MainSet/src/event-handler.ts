import { EventType, GameEvent, PlayerRequestEvent, GameStartEvent, CardsMovedEvent, CardFlippedEvent, DeckShuffledEvent, HostRequestEvent } from "./event";
import { Player } from "./player";
import { constants } from "./constants";
import { Card } from "./card";
import { GameLog } from "./game-log";
import { PlayerChooser } from "./player-chooser";
import { Board } from "./board";
import { CardContainer } from "./card-container";
import { Utilities } from "./utilities";

export class EventHandler {

    public EVENT_HANDLERS: ((event: GameEvent) => void)[] = [];
    public gameLog = new GameLog();
    public afterGameStartCallback: (() => void) = null;

    //TODO: Host will listen for registrations, 
    // choose who is playing, send back id, store ids in local storage in case refresh
    // and populate this list with correct names.
    public machineIdToName = new Map<number, string>();

    // the clients that were actually chosen to play the game
    public machineIds: number[] = [];
    public playerId: number = null;
    // Determines whose field is currently being displayed.
    public shownPlayersId: number = null;
    public hostMachineId: number = null;

    constructor(
        private machineId: number,
        private board: Board,
        private players: Player[],
        public includedPlayers: Map<number, number>,
        private hostSection: HTMLElement,
        private table: HTMLElement,
        private fieldIndex: CardContainer[],
        private cardIndex: Card[]
    ) {
        this.EVENT_HANDLERS[EventType.PlayerRequestEvent] = this.onPlayerRequestEvent.bind(this);
        this.EVENT_HANDLERS[EventType.GameStartEvent] = this.onGameStartEvent.bind(this);
        this.EVENT_HANDLERS[EventType.CardsMovedEvent] = this.onCardsMovedEvent.bind(this);
        this.EVENT_HANDLERS[EventType.CardFlippedEvent] = this.onCardFlippedEvent.bind(this);
        this.EVENT_HANDLERS[EventType.DeckShuffledEvent] = this.onDeckShuffledEvent.bind(this);
        this.EVENT_HANDLERS[EventType.HostRequestEvent] = this.onHostRequestEvent.bind(this);
    }

    /**
     * This method should block and handle each event passed to it sequentially.
     * Once it completes the next event will be fetched, so the ui has to be ready.
     * @param {the event} event 
     */
    public async handleEvents(eventsArray: GameEvent[]) {
        // All events have a type
        // use this to select the handler.
        for (let i = 0; i < eventsArray.length; i++) {
            let event = eventsArray[i];
            console.log("Event: " + (EventType[event.type]))
            if (this.EVENT_HANDLERS[event.type]) {
                await this.EVENT_HANDLERS[event.type](event);
            }
        }

    }

    public onPlayerRequestEvent(event: GameEvent): void {
        let evt = event as PlayerRequestEvent;
        this.machineIdToName.set(evt.machineId, evt.name);
        // disable button if were already registered.
        if (evt.machineId === this.machineId) {
            (document.getElementById("player-btn") as HTMLButtonElement).disabled = true;
        }
        this.gameLog.logEvent(evt.name + " Requested to join the game.");
        this.gameLog.logEvent("")

        this.hostSection.appendChild(new PlayerChooser(evt.machineId, evt.name, this.board.superHeros, this.includedPlayers).element)

    }

    public onGameStartEvent(event: GameEvent): void {

        // For this event, the first time the host is here they have already sent out the shuffle events to put the cards in the correct order.
        // After that, even if we are the host we want to act the same?
        // Then this event won't trigger other events. perfect.

        //TODO: remove shuffle from here.
        // Put that in the game start button click

        let evt = (event as GameStartEvent);
        this.machineIds = evt.machineIds;

        this.machineIds.forEach((macId, id) => {
            this.players.push(
                new Player(this.table, this.fieldIndex, this.machineIdToName.get(macId), id)
            );
        });


        // determine what our id is based on the gamestart event
        this.playerId = this.machineIds.indexOf(this.machineId);
        console.log("setting id to: " + this.playerId);
        console.log("Our Machine id is " + this.machineId);
        console.log("Our Machine id mod 100000000 is " + Utilities.mod(this.machineId, 100000000));

        this.shownPlayersId = Math.max(this.playerId, 0);

        this.players.forEach((player, index) => {
            // Fill their deck
            // TODO: its okay to create cards here, but they need to shuffle after...
            // Solution is to create enough starter cards for everyone before hand.
            // Then can asume the cards are used in order to fill deck

            // TODO: dont create cards, just take
            for (let i = 0; i < constants.NUM_PUNCHES; i++) {
                player.deck.addCard(this.board.punches[i + constants.NUM_PUNCHES * index]);
            }

            for (let i = 0; i < constants.NUM_VULNERABILITIES; i++) {
                player.deck.addCard(this.board.vulnerabilities[i + constants.NUM_VULNERABILITIES * index]);
            }

            player.hand.isFaceUp = index === this.playerId;
            player.setVisible(index === this.shownPlayersId);
            player.superHeros.addCard(this.cardIndex[evt.heroIds[index]]);

            // Second 
            let rowY = constants.DEFAULT_SPACE * 2 + constants.CARD_HEIGHT;
            player.ongoing.setXY(2 * constants.DEFAULT_SPACE + constants.CARD_WIDTH, rowY);

            // Third
            rowY = constants.DEFAULT_SPACE * 3 + constants.CARD_HEIGHT * 2;
            player.workArea.setXY(2 * constants.DEFAULT_SPACE + constants.CARD_WIDTH, rowY);
            player.superHeros.setXY(7 * constants.DEFAULT_SPACE + 6 * constants.CARD_WIDTH, rowY);

            // Fourth row
            rowY = constants.DEFAULT_SPACE * 4 + constants.CARD_HEIGHT * 3;
            player.discard.setXY(constants.DEFAULT_SPACE, rowY);
            player.hand.setXY(2 * constants.DEFAULT_SPACE + constants.CARD_WIDTH, rowY);
            player.deck.setXY(7 * constants.DEFAULT_SPACE + 6 * constants.CARD_WIDTH, rowY);

            player.deck.adjustCards();
            player.discard.adjustCards();
            player.ongoing.adjustCards();
            player.superHeros.adjustCards();
            player.workArea.adjustCards();
        });

        this.board.lineup.adjustCards();
        this.board.villains.adjustCards();
        this.board.villains.cards[0].setFaceUp(true);

        this.board.mainDeck.adjustCards();
        this.board.weaknesses.adjustCards();
        this.board.kicks.adjustCards();

        document.getElementById("registration-page").style.display = "none";

        if (this.afterGameStartCallback) {
            this.afterGameStartCallback();
        }


        this.gameLog.logEvent("GAME STARTED!")
        this.gameLog.logEvent("")


    }
    public onCardsMovedEvent(event: GameEvent): void {
        let evt = event as CardsMovedEvent;
        let name = evt.playerId >= 0 && this.players[evt.playerId] ? this.players[evt.playerId].name : "Host";
        this.gameLog.logEvent(name + " Moved " + evt.cardIds.length + " card(s) to " + this.fieldIndex[evt.fieldToId].name);

        // This only works because I enforce all selected cards are from the same field.
        // Move all without adjusting
        evt.cardIds.forEach(cardId => {
            this.fieldIndex[evt.fieldToId].addCard(this.cardIndex[cardId].field.take(cardId), false);
            this.gameLog.logEvent(this.cardIndex[cardId].cardInfo.CardName);
        })
        // adjust after
        this.fieldIndex[evt.fieldToId].adjustCards();
        this.cardIndex[evt.cardIds[0]].field.adjustCards();
        this.gameLog.logEvent("");
    }

    public onCardFlippedEvent(event: GameEvent): void {
        let evt = event as CardFlippedEvent;
        let name = evt.playerId >= 0 && this.players[evt.playerId] ? this.players[evt.playerId].name : "Host";

        this.gameLog.logEvent(name + " Flipped card: " + this.cardIndex[evt.cardId].cardInfo.CardName);
        this.cardIndex[evt.cardId].setFaceUp(evt.faceUp);
        this.gameLog.logEvent("")

    }

    public onDeckShuffledEvent(event: GameEvent): void {
        let evt = event as DeckShuffledEvent;
        let name = evt.playerId >= 0 && this.players[evt.playerId] ? this.players[evt.playerId].name : "Host";

        this.gameLog.logEvent(name + " Shuffled deck: " + this.fieldIndex[evt.fieldId].name);

        // build new deck list.
        let cards: Card[] = [];
        evt.cardOrder.forEach(cardId => {
            cards.push(this.cardIndex[cardId]);
        })

        this.fieldIndex[evt.fieldId].cards = cards;
        this.fieldIndex[evt.fieldId].adjustCards();
        this.gameLog.logEvent("")

    }

    public onHostRequestEvent(event: GameEvent): void {
        let evt = event as HostRequestEvent;
        // Make sure host has not already been chosen.
        if (!this.hostMachineId) {
            this.hostMachineId = evt.machineId;
            (document.getElementById("host-btn") as HTMLButtonElement).style.visibility = "hidden";
            if (this.machineId === this.hostMachineId) {
                // we are the host
                this.hostSection.style.display = "block";
            }
        }
        // Others should just wait until game start now.
    }
}