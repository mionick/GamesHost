import { CardInfo } from "./card-info";

export class Card {
    constructor(
        public element : HTMLElement = null,
        public cardInfo : CardInfo
    ) {
    }
}