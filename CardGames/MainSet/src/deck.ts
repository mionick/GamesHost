import { Card } from "./card";
import { constants } from "./constants";
import { CardContainer } from "./card-container";

export class Deck extends CardContainer {

    constructor( public isFaceUp : boolean, table: HTMLElement, fieldIndex : CardContainer[]) {
        
        super();

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
        this.adjustCards();
    }

    public addCardToTop(card : Card) : void {
        this.cards.unshift(card);   
        this.adjustCards();

    }
    
    public addCardToBottom(card : Card) : void {
        this.cards.push(card);  
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
    }

    
    public adjustCards() : void {
        // Could be negative, thats fine. Will squish cards.
        this.cards.forEach( (card, i) => {
            let height = (this.cards.length - i);
            card.x = this.x + height * constants.DECK_LEAN_X_FACTOR;
            card.y = this.y + height * constants.DECK_LEAN_Y_FACTOR;
            card.element.style.transform = "translate(" + ( card.x ) + "px," + ( card.y ) + "px)";
            card.element.style.zIndex = "" + (height + 1);
            card.element.style.display = this.visible ? "block" : "none";

            if (this.isFaceUp){
                card.setFaceUp();
            } else {
                card.setFaceDown();
            }

        });

    }

    public draw() : Card {
        let result = this.cards.shift();
        this.adjustCards();
        return result;
    }

    public searchAndTake(cardName: string) : Card {
        let index = this.cards.findIndex( x => x.cardInfo.CardName === cardName);

        let result = index < 0 ? null : this.cards.splice( index , 1 )[0];
        this.adjustCards();
        return result;
    }
}

