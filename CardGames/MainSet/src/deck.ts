import { Card } from "./card";
import { constants } from "./constants";
import { CardContainer } from "./card-container";

export class Deck extends CardContainer {

    constructor( 
            public isFaceUp : boolean, 
            table: HTMLElement, 
            fieldIndex : CardContainer[],
            name: string
        ) {
        
        super(name);

        this.w = constants.CARD_WIDTH;
        this.h = constants.CARD_HEIGHT;
           
        let div = document.createElement("div");
        div.id = fieldIndex.length + "";
        fieldIndex.push(this);

        div.classList.add("field")
        div.style.width = this.w + "px";
        div.style.height = this.h + "px";
    
        this.element = div;
        
        // Add display element
        if (table){
            table.appendChild(div);
        }
    }
    

    /** Adds a card to the top of the deck */
    public addCard(card : Card) : void{
        this.cards.unshift(card);
        card.field = this;
        this.adjustCards();
    }

    public addCardToTop(card : Card) : void {
        this.cards.unshift(card);   
        card.field = this;
        this.adjustCards();

    }
    
    public addCardToBottom(card : Card) : void {
        this.cards.push(card);  
        card.field = this;
        this.adjustCards();        
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
        this.adjustCards();
    }

    
    public adjustCards() : void {
        // Could be negative, thats fine. Will squish cards.
        this.cards.forEach( (card, i) => {
            let height = (this.cards.length - i);
            card.x = this.x + height * constants.DECK_LEAN_X_FACTOR;
            card.y = this.y + height * constants.DECK_LEAN_Y_FACTOR;
            card.element.style.transform = "translate(" + ( card.x ) + "px," + ( card.y ) + "px)";
            card.element.style.zIndex = "" + (height + 1);
            card.element.style.visibility = this.visible ? "visible" : "hidden";

            if (this.isFaceUp){
                card.setFaceUp();
            } else {
                card.setFaceDown();
            }

        });

    }

    public draw() : Card {
        let result = this.cards.shift();
        if(result) {
            result.field = null;
        }
        this.adjustCards();
        return result;
    }

    public searchAndTake(cardName: string) : Card {
        let index = this.cards.findIndex( x => x.cardInfo.CardName === cardName);

        let result = index < 0 ? null : this.cards.splice( index , 1 )[0];
        if(result) {
            result.field = null;
        }
        this.adjustCards();
        return result;
    }

    public getTouchedCard(x: number, y: number): Card {
        // Need to check the card too becsayse the decks can grow putside their bounds.
        // There is a card, the touch was either on the deck or the top card, return the card.
        
        //return this.cards.length > 0 && (this.contains(x, y) || this.cards[0].contains(x, y)) && this.cards[0];

        // The above is correct, but it leads to the possibility of clicking on a card and not clicking on  field.
        // cards should know what field they belong too, should have to resolve card and field separately.
        // simplifying for now.

        return this.cards.length > 0 && (this.contains(x, y)) && this.cards[0];

    }

}

