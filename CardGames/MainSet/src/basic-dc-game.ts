/** This serves as the entry point for the game. */
import { Card } from "./card";
import { constants } from "./constants";
import { Deck } from "./deck";
import { Field } from "./field";
import { CardInfo } from "./card-info";

declare var CARD_LIST: CardInfo[];

/**
 * Don’t ever use the types Number, String, Boolean, or Object. These types refer to non-primitive boxed objects that are almost never used appropriately in JavaScript code.

    WRONG
    function reverse(s: String): String;
    Do use the types number, string, and boolean.

    OK
    function reverse(s: string): string;
 */

constants.initialize();

let weaknesses = new Deck(true);
let kicks = new Deck(true);
let mainDeck = new Deck();
let destroyed = new Deck(true);
let discard = new Deck(true);
let villains = new Deck(true);
let personal = new Deck();

let hand = new Field(true);
let workArea = new Field(true);
let ongoing = new Field(true);
let lineup = new Field(true);
let opponentHand = new Field();

let table = document.getElementById("table");

CARD_LIST.forEach(cardInfo => {
   let img = document.createElement("img");
   img.src = "assets/cards/" + cardInfo.FileName;

   img.style.width = constants.CARD_WIDTH + "px";
   img.style.height = constants.CARD_HEIGHT + "px";

   table.appendChild(img);
   
   if (cardInfo.CardType == "Super Hero") {
      // TODO: these cards are bigger.
   }

   let card = new Card(img, cardInfo);
});





