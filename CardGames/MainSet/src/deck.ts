import { Card } from "./card";
import { constants } from "./constants";

export class Deck {
    
    public cards : Card[] = [];

    // In pixels
    public x : number = 0;
    public y : number = 0;

    constructor( public isFaceUp : boolean = false) {
    }

    public addCard(newCard : Card){
        this.cards.push(newCard);
    }

    public addCardToTop(card : Card) {
        this.cards.unshift(card);   
    }
    
    public addCardToBottom(card : Card) {
        this.cards.push(card);   
    }

    /**
     * Fisher and Yates
     */
    public shuffle() : void {
        var j, x, i;
        let a = this.cards;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
    }

    
    public adjustCards() : void {
        // Could be negative, thats fine. Will squish cards.
        this.cards.forEach( (card, i) => {
            let height = (this.cards.length - i);
            card.element.style.transform = "translate(" + ( this.x + height * constants.DECK_LEAN_X_FACTOR ) + "px," + ( this.y + height * constants.DECK_LEAN_Y_FACTOR ) + "px)";
            card.element.style.zIndex = "" + height;

            if (this.isFaceUp){
                card.setFaceUp();
            } else {
                card.setFaceDown();
            }

        });

    }

    public draw() : Card {
        return this.cards.shift();
    }

    public take(cardName: string) : Card {
        let index = this.cards.findIndex( x => x.cardInfo.CardName === cardName);

        return index < 0 ? null : this.cards.splice( index , 1 )[0];
    }
}

