import { CardInfo } from "./card-info";
import { constants } from "./constants";

export class Card {
    
    public element : HTMLImageElement = null;
    private mouseDownEvt: MouseEvent;

    constructor(
        public cardInfo : CardInfo,
        table: HTMLElement = null
    ) {
        let img = document.createElement("img");

        img.src = "assets/cards/" + cardInfo.FileName;
        img.classList.add("card")
     
        img.style.width = constants.CARD_WIDTH + "px";
        img.style.height = constants.CARD_HEIGHT + "px";
    
        this.element = img;
        
        // Add display element
        if (table){
            table.appendChild(img);
        }

        // TODO: this will have to move out to the document, not one on each card.
        // Event Listeners 


        img.addEventListener('mousedown', (event) => this.mouseDownEvt = event );
        img.addEventListener('mousemove', (event) => {
            
            if(this.mouseDownEvt && this.isDragEvent(this.mouseDownEvt, event)) {
                // TODO: draw a line here
            }
        });
        img.addEventListener('mouseup', (event) => {
            if(this.isDragEvent(this.mouseDownEvt, event)) {
                // TODO: pass event down to field underneath. Needs to take this card from the field or deck it's part of.
            } else {
                console.log('clicked on card:' + this.cardInfo.CardName);
            }
            this.mouseDownEvt = null;
        });

    }

    private isDragEvent(event1: MouseEvent, event2: MouseEvent) {
        return Math.abs(event1.pageX - event2.pageX) > 5 || Math.abs(event1.pageY - event2.pageY) > 5;
    }

    public setFaceDown(): void {
        this.element.src = constants.CARDS_FOLDER + constants.BACK_OF_CARD;
    }
    public setFaceUp(): void {
        this.element.src = constants.CARDS_FOLDER + this.cardInfo.FileName;
    }
}