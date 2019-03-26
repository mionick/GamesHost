import { Card } from "./card";
import { constants } from "./constants";

export class Field {
    
    private cards : Card[] = [];

    // In pixels
    public x : number = 0;
    public y : number = 0;
    public width : number;
    public height : number = constants.CARD_HEIGHT;
    
    constructor( public isFaceUp : boolean = false) {
    }

    public adjustCards() : void {
        // Could be negative, thats fine. Will squish cards.
        let space = (this.width - this.cards.length * constants.CARD_WIDTH) / (this.cards.length - 1);

        this.cards.forEach( (card, i) => {
            card.element.style.transform = "translate(" + this.x + i*(constants.CARD_WIDTH + space) + "," + this.y + ")";
            card.element.style.zIndex = "" + i;
        });

    }

}