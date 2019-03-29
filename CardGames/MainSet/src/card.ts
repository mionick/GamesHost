import { CardInfo } from "./card-info";
import { constants } from "./constants";
import { CardContainer } from "./card-container";

export class Card {
   
    public element : HTMLImageElement = null;

    public x = 0;
    public y = 0;

    private isFaceUp = true;

    public field: CardContainer = null;

    constructor(
        public id: number = null,
        public cardInfo : CardInfo,
        table: HTMLElement = null
    ) {
        let img = document.createElement("img");

        // Links htmlelement to js object
        img.id = id + "";
        img.src = "assets/cards/" + cardInfo.FileName;
        img.classList.add("card")
     
        img.style.width = constants.CARD_WIDTH + "px";
        img.style.height = constants.CARD_HEIGHT + "px";
    
        this.element = img;
        
        // Add display element
        if (table){
            table.appendChild(img);
        }

    }

    public setFaceDown(): void {
        this.element.src = constants.CARDS_FOLDER + constants.BACK_OF_CARD;
        this.isFaceUp = false;
    }
    public setFaceUp(): void {
        this.element.src = constants.CARDS_FOLDER + this.cardInfo.FileName;
        this.isFaceUp = true;
    }
    public getText(): string {
        return this.isFaceUp ? this.cardInfo.CardText : "";
    }

    public contains(x: number, y : number) : boolean {
        return (this.x < x && 
        this.x + constants.CARD_WIDTH > x &&
        this.y < y &&
        this.y + constants.CARD_HEIGHT > y);
    }
}