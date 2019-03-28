import { Card } from "./card";
import { constants } from "./constants";
import { CardContainer } from "./card-container";

export class Field extends CardContainer {

    public size_in_cards = 5;

    constructor( public isFaceUp : boolean, table: HTMLElement, fieldIndex : CardContainer[]) {
        super();

        let div = document.createElement("div");

        div.classList.add("field")
     
        // (this.size_in_cards - 1) spaces =  cards will go right to the edge when theres 5
        this.w = constants.CARD_WIDTH * this.size_in_cards + constants.DEFAULT_SPACE * (this.size_in_cards - 1);
        this.h = constants.CARD_HEIGHT;

        div.id = fieldIndex.length + "";
        fieldIndex.push(this);

        div.style.width = this.w + "px";
        div.style.height = this.h + "px";
    
        this.element = div;
        
        // Add display element
        if (table){
            table.appendChild(div);
        }
    }

    public adjustCards() : void {

        if (this.cards.length == 0) {
            return;
        }

        let space = 0;
        let tooManyCards = this.cards.length >= this.size_in_cards;
        if (tooManyCards) {
            // Need to adjust different. No spaces at the sides.
            space = 
            (this.w - this.cards.length * constants.CARD_WIDTH) 
            / (this.cards.length - 1);
        } else{
            space = 
            (this.w - this.cards.length * constants.CARD_WIDTH) 
            / (this.cards.length + 1);
        }

        this.cards.forEach( (card, i) => {

            if (tooManyCards){
                card.x = (this.x + (i)*space + (i * constants.CARD_WIDTH));
            } else {
                card.x = (this.x + (i+1)*space + (i * constants.CARD_WIDTH));
            }
            card.y = this.y;
            card.element.style.transform = "translate(" + ( card.x ) + "px," + ( card.y ) + "px)";
            card.element.style.zIndex = "" + (i + 1);
            card.element.style.display = this.visible ? "block" : "none";

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
            this.adjustCards();
        }
    }

}