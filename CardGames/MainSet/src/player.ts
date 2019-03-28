import { Deck } from "./deck";
import { Field } from "./field";
import { constants } from "./constants";
import { Card } from "./card";
import { CardContainer } from "./card-container";

export class Player {

    public name : string = "";
    
    public superHeros : Deck;
    public discard : Deck;
    public deck : Deck;
    public hand : Field;
    public workArea : Field;
    public ongoing : Field;

    constructor(table: HTMLElement, fieldIndex: CardContainer[]){
        this.superHeros = new Deck(true, table, fieldIndex);
        this.discard = new Deck(true, table, fieldIndex);
        this.deck = new Deck(false, table, fieldIndex);
        this.hand = new Field(true, table, fieldIndex);
        this.workArea = new Field(true, table, fieldIndex);
        this.ongoing = new Field(true, table, fieldIndex);
    }

    public drawHand() : void {
        for(let i = 0; i < constants.HAND_SIZE; i++){
            this.hand.addCard(this.deck.draw());
        }
    }
}