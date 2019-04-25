import { Deck } from "./deck";
import { Field } from "./field";
import { CardContainer } from "./card-container";
import { constants } from "./constants";
import { CardInfo } from "./card-info";
import { Card } from "./card";

export class Board {
    //This will be the same for everyone, can be done immediately.
    // Need to initialize players during game start though
    public weaknesses: Deck;
    public kicks: Deck;
    public mainDeck: Deck;
    public destroyed: Deck;
    public lineup: Field;
    public superHeros: Deck;
    public villains: Deck;
    public punches: Card[] = [];
    public vulnerabilities: Card[] = [];

    constructor(table : HTMLElement, cardContainerIndex: CardContainer[]) {

        this.weaknesses = new Deck(true, table, cardContainerIndex, "Weakness Stack");
        this.kicks = new Deck(true, table, cardContainerIndex, "Kick Stack");
        this.mainDeck = new Deck(false, table, cardContainerIndex, "Main Deck");
        this.destroyed = new Deck(true, table, cardContainerIndex, "Destroyed Pile");
        this.lineup = new Field(true, table, cardContainerIndex, "Line-Up");
        this.superHeros = new Deck(true, table, cardContainerIndex, "Super Heros Deck");
        this.villains = new Deck(false, table, cardContainerIndex, "Super Villains Deck");
                

        this.superHeros.setVisible(false);
        this.destroyed.element.id = "destroyed";

        // Position Fields
        // Center
        let rowY = constants.DEFAULT_SPACE;

        this.villains.setXY(constants.DEFAULT_SPACE, rowY);
        this.lineup.setXY(2 * constants.DEFAULT_SPACE + constants.CARD_WIDTH, rowY);
        this.mainDeck.setXY(7 * constants.DEFAULT_SPACE + 6 * constants.CARD_WIDTH, rowY);

        // Second
        rowY = constants.DEFAULT_SPACE * 2 + constants.CARD_HEIGHT;
        this.weaknesses.setXY(constants.DEFAULT_SPACE, rowY);
        this.kicks.setXY(7 * constants.DEFAULT_SPACE + 6 * constants.CARD_WIDTH, rowY);

        // Third
        rowY = constants.DEFAULT_SPACE * 3 + constants.CARD_HEIGHT * 2;
        this.destroyed.setXY(constants.DEFAULT_SPACE, rowY);
    }   

    public init(cardInfoList: CardInfo[], cardIndex: Card[], table: HTMLElement) {
        cardInfoList.forEach((cardInfo) => {
            // Need to go through each card and assign it to the correct deck.
         
            // cardIndex.length will guarantee unique id, even when creating more than one of same card.
            if (cardInfo.CardName === constants.CARD_NAMES.KICK) {
               for (let i = 0; i < constants.NUM_KICKS; i++) {
                  let card = new Card(cardIndex.length, cardInfo, table);
                  this.kicks.addCard(card);
                  cardIndex.push(card);
         
               }
            } else {
               switch (cardInfo.CardType) {
                  case constants.CARD_TYPES.SUPER_HERO: {
                     // TODO: these cards are bigger. but they actually look fine at normal size. 
                     let card = new Card(cardIndex.length, cardInfo, table);
                     this.superHeros.addCard(card);
                     cardIndex.push(card);
         
                     break;
                  }
                  case constants.CARD_TYPES.SUPER_VILLAIN: {
                     let card = new Card(cardIndex.length, cardInfo, table);
                     this.villains.addCard(card);
                     cardIndex.push(card);
         
                     break;
                  }
                  case constants.CARD_TYPES.WEAKNESS: {
                     for (let i = 0; i < constants.NUM_WEAKNESSES; i++) {
                        let card = new Card(cardIndex.length, cardInfo, table);
                        this.weaknesses.addCard(card);
                        cardIndex.push(card);
         
                     }
                     break;
                  }
                  // Hard coded 6 here is max number of players
                  case constants.CARD_TYPES.STARTER: {
                     if (cardInfo.CardName === constants.CARD_NAMES.PUNCH) {
                        for (let i = 0; i < constants.NUM_PUNCHES * 6; i++) {
                           let card = new Card(cardIndex.length, cardInfo, table);
                           this.punches.push(card);
                           cardIndex.push(card);
                        }
                     }
                     else if (cardInfo.CardName === constants.CARD_NAMES.VULNERABILITY) {
                        for (let i = 0; i < constants.NUM_VULNERABILITIES * 6; i++) {
                           let card = new Card(cardIndex.length, cardInfo, table);
                           this.vulnerabilities.push(card);
                           cardIndex.push(card);
                        }
                     }
         
                  }
                  default: {
                     for (let i = 0; i < Number.parseInt(cardInfo.Copies || "0"); i++) {
                        let card = new Card(cardIndex.length, cardInfo, table);
                        this.mainDeck.addCard(card);
                        cardIndex.push(card);
         
                     }
                  }
               }
            }
         });
    }
}