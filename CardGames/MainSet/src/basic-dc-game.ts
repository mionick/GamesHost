/** This serves as the entry point for the game. */
import { Card } from "./card";
import { constants } from "./constants";
import { Deck } from "./deck";
import { Field } from "./field";
import { CardInfo } from "./card-info";
import { Player } from "./player";

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
let villains = new Deck();


let lineup = new Field(true);

let superHeros = new Field(true);

let table = document.getElementById("table");

let thisPlayer = new Player();

let players = [ thisPlayer ];


// Position the fields.
let rowY = constants.HEIGHT - (constants.CARD_HEIGHT + constants.DEFAULT_SPACE);
thisPlayer.discard.x = constants.DEFAULT_SPACE;
thisPlayer.discard.y = rowY;

thisPlayer.hand.x = 2 * constants.DEFAULT_SPACE + constants.CARD_WIDTH;
thisPlayer.hand.y = rowY;

thisPlayer.deck.x = 7 * constants.DEFAULT_SPACE + 6 * constants.CARD_WIDTH;
thisPlayer.deck.y = rowY;

// Center
rowY = constants.DEFAULT_SPACE;
villains.x = constants.DEFAULT_SPACE;
villains.y = rowY;

lineup.x = 2 * constants.DEFAULT_SPACE + constants.CARD_WIDTH;
lineup.y = rowY;

mainDeck.x = 7 * constants.DEFAULT_SPACE + 6 * constants.CARD_WIDTH;
mainDeck.y = rowY;

// Second
rowY = constants.DEFAULT_SPACE * 2 + constants.CARD_HEIGHT;
weaknesses.x = constants.DEFAULT_SPACE;
weaknesses.y = rowY;

thisPlayer.ongoing.x = 2 * constants.DEFAULT_SPACE + constants.CARD_WIDTH;
thisPlayer.ongoing.y = rowY;

kicks.x = 7 * constants.DEFAULT_SPACE + 6 * constants.CARD_WIDTH;
kicks.y = rowY;

// Third
rowY = constants.DEFAULT_SPACE * 3 + constants.CARD_HEIGHT * 2;

thisPlayer.workArea.x = 2 * constants.DEFAULT_SPACE + constants.CARD_WIDTH;
thisPlayer.workArea.y = rowY;

thisPlayer.superHeros.x = 7 * constants.DEFAULT_SPACE + 6 * constants.CARD_WIDTH;
thisPlayer.superHeros.y = rowY;


// CARD_LIST  defined as global object in assets/cards.js, loaded by index.html before this is run.
CARD_LIST.forEach(cardInfo => {
   // Need to go through each card and assign it to the correct deck.
   if (cardInfo.CardName === constants.CARD_NAMES.KICK){
      for(let i = 0; i < constants.NUM_KICKS; i++){
         kicks.addCard(new Card(cardInfo, table));
      }
   } else {
      switch (cardInfo.CardType) {
         case constants.CARD_TYPES.SUPER_HERO: {
            // TODO: these cards are bigger. but they actually look fine at normal size. 
            thisPlayer.superHeros.addCard(new Card(cardInfo, table));
            break;
         }
         case constants.CARD_TYPES.SUPER_VILLAIN: {
            villains.addCard(new Card(cardInfo, table));
            break;
         }
         case constants.CARD_TYPES.WEAKNESS: {
            for(let i = 0; i < constants.NUM_WEAKNESSES; i++){
               weaknesses.addCard(new Card(cardInfo, table));
            }
            break;
         }
         case constants.CARD_TYPES.STARTER: {
            if (cardInfo.CardName === constants.CARD_NAMES.PUNCH){
               players.forEach(player => {
                  for(let i = 0; i < constants.NUM_PUNCHES; i++){
                        player.deck.addCard(new Card(cardInfo, table));
                  }
               });
               
            }
            else if (cardInfo.CardName === constants.CARD_NAMES.VULNERABILITY){
               players.forEach(player => {
                  for(let i = 0; i < constants.NUM_VULNERABILITIES; i++){
                        player.deck.addCard(new Card(cardInfo, table));
                  }
               });
            }
         }
         default: {
            for(let i = 0; i < Number.parseInt(cardInfo.Copies || "0"); i++){
               mainDeck.addCard(new Card(cardInfo, table));
            }
         }
      }
   }
});


// Game Starts
mainDeck.shuffle();
villains.shuffle();
villains.addCardToTop(villains.take(constants.STARTING_VILLAIN))
lineup.addCard(mainDeck.draw());
lineup.addCard(mainDeck.draw());
lineup.addCard(mainDeck.draw());
lineup.addCard(mainDeck.draw());
lineup.addCard(mainDeck.draw());

lineup.adjustCards();
villains.adjustCards();
villains.cards[0].setFaceUp();

mainDeck.adjustCards();
weaknesses.adjustCards();
kicks.adjustCards();

players.forEach(player => {
   player.deck.shuffle();
   player.drawHand();
   player.hand.adjustCards();
   player.deck.adjustCards();
   player.discard.adjustCards();
   player.ongoing.adjustCards();
   player.superHeros.adjustCards();
   player.workArea.adjustCards();
});




