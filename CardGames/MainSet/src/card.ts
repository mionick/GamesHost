import { CardInfo } from "./card-info";
import { constants } from "./constants";

export class Card {
    
    public element : HTMLImageElement = null;

    public x = 0;
    public y = 0;

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
    }
    public setFaceUp(): void {
        this.element.src = constants.CARDS_FOLDER + this.cardInfo.FileName;
    }
}