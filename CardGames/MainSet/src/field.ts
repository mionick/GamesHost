import { Card } from "./card";
import { constants } from "./constants";

export class Field {
    
    private cards : Card[] = [];

    // In pixels
    public x : number = 0;
    public y : number = 0;
    public size_in_cards = 5;
    
    constructor( public isFaceUp : boolean = false) {
    }

    public adjustCards() : void {
        // Could be negative, thats fine. Will squish cards.
        let space = (this.size_in_cards*constants.CARD_WIDTH + (this.size_in_cards - 1)*constants.DEFAULT_SPACE - this.cards.length * constants.CARD_WIDTH) / (this.cards.length - 1);

        this.cards.forEach( (card, i) => {

            card.element.style.transform = "translate(" + (this.x + i*(constants.CARD_WIDTH + space)) + "px," + this.y + "px)";
            card.element.style.zIndex = "" + i;

            if (this.isFaceUp){
                card.setFaceUp();
            } else {
                card.setFaceDown();
            }
            
        });

    }

    public addCard(newCard : Card){
        if (newCard){
            this.cards.push(newCard);
        }
    }

}