import { Card } from "./card";

export class Deck {
    
    public isFaceUp : boolean = false;
    private cards : Card[] = [];

    constructor() {
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
}

