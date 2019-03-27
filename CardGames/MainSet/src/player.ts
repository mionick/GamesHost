import { Deck } from "./deck";
import { Field } from "./field";
import { constants } from "./constants";
import { Card } from "./card";

export class Player {

    public name : string = "";
    
    public superHeros = new Deck(true);
    public discard = new Deck(true);
    public deck = new Deck();
    public hand = new Field(true);
    public workArea = new Field(true);
    public ongoing = new Field(true);

    constructor(){

    }

    public drawHand() : void {
        for(let i = 0; i < constants.HAND_SIZE; i++){
            this.hand.addCard(this.deck.draw());
        }
    }
}