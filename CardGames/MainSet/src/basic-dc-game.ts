/** This serves as the entry point for the game. */
import { Card } from "./card";
import { constants } from "./constants";
import { Deck } from "./deck";
import { Field } from "./field";
import { CardInfo } from "./card-info";
import { Player } from "./player";
import { CardContainer } from "./card-container";

// CARD_LIST  defined as global object in assets/cards.js, loaded by index.html before this is run.
declare var CARD_LIST: CardInfo[];

/**
 * Don’t ever use the types Number, String, Boolean, or Object. These types refer to non-primitive boxed objects that are almost never used appropriately in JavaScript code.

    WRONG
    function reverse(s: String): String;
    Do use the types number, string, and boolean.

    OK
    function reverse(s: string): string;
 */

 // constants are set based on the size of the start screen.
constants.initialize();

let table = document.getElementById("table");

let fieldIndex : CardContainer[] = [];

let weaknesses = new Deck(true, table, fieldIndex);
let kicks = new Deck(true, table, fieldIndex);
let mainDeck = new Deck(false, table, fieldIndex);
let destroyed = new Deck(true, table, fieldIndex);
let villains = new Deck(false, table, fieldIndex);
let lineup = new Field(true, table, fieldIndex);
let superHeros = new Deck(true, table, fieldIndex);
superHeros.setVisible(false);



let thisPlayer = new Player(table, fieldIndex);
thisPlayer.name = "Nick";

let playerId = 0; // TODO: this will be assigned by the host once the game starts.
// Determines whose field is currently being displayed.
let shownPlayersId = playerId;

let players = [ thisPlayer, new Player(table, fieldIndex) ];


// Provides an ordered lookup of every card created.
let cardIndex : Card[] = [];



// CARD_LIST  defined as global object in assets/cards.js, loaded by index.html before this is run.
let idOffset = 0;
CARD_LIST.forEach((cardInfo, idx) => {
   // Need to go through each card and assign it to the correct deck.

   // idOffset + idx will guarantee unique id, even when creating more than one of same card.
   if (cardInfo.CardName === constants.CARD_NAMES.KICK){
      for(let i = 0; i < constants.NUM_KICKS; i++){
         let card = new Card(idOffset, cardInfo, table); 
         kicks.addCard(card); 
         cardIndex.push(card);
         idOffset++;
      }
   } else {
      switch (cardInfo.CardType) {
         case constants.CARD_TYPES.SUPER_HERO: {
            // TODO: these cards are bigger. but they actually look fine at normal size. 
            let card = new Card(idOffset, cardInfo, table); 
            superHeros.addCard(card); 
            cardIndex.push(card);
            idOffset++;
            break;
         }
         case constants.CARD_TYPES.SUPER_VILLAIN: {
            let card = new Card(idOffset, cardInfo, table); 
            villains.addCard(card); 
            cardIndex.push(card);
            idOffset++;
            break;
         }
         case constants.CARD_TYPES.WEAKNESS: {
            for(let i = 0; i < constants.NUM_WEAKNESSES; i++){
               let card = new Card(idOffset, cardInfo, table); 
               weaknesses.addCard(card); 
               cardIndex.push(card);
               idOffset++;
            }
            break;
         }
         case constants.CARD_TYPES.STARTER: {
            if (cardInfo.CardName === constants.CARD_NAMES.PUNCH){
               players.forEach(player => {
                  for(let i = 0; i < constants.NUM_PUNCHES; i++){
                     let card = new Card(idOffset, cardInfo, table); 
                     player.deck.addCard(card); 
                     cardIndex.push(card);
                     idOffset++;
                  }
               });
               
            }
            else if (cardInfo.CardName === constants.CARD_NAMES.VULNERABILITY){
               players.forEach(player => {
                  for(let i = 0; i < constants.NUM_VULNERABILITIES; i++){
                     let card = new Card(idOffset, cardInfo, table); 
                     player.deck.addCard(card); 
                     cardIndex.push(card);
                     idOffset++;
                  }
               });
            }
         }
         default: {
            for(let i = 0; i < Number.parseInt(cardInfo.Copies || "0"); i++){
               let card = new Card(idOffset, cardInfo, table); 
               mainDeck.addCard(card); 
               cardIndex.push(card);
               idOffset++;
            }
         }
      }
   }
});


// Game Starts
mainDeck.shuffle();
villains.shuffle();
superHeros.shuffle();
villains.addCardToTop(villains.searchAndTake(constants.STARTING_VILLAIN))
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

// Position Fields
// Center
let rowY = constants.DEFAULT_SPACE;

villains.setXY(constants.DEFAULT_SPACE, rowY);
lineup.setXY(2 * constants.DEFAULT_SPACE + constants.CARD_WIDTH, rowY);
mainDeck.setXY(7 * constants.DEFAULT_SPACE + 6 * constants.CARD_WIDTH, rowY);

// Second
rowY = constants.DEFAULT_SPACE * 2 + constants.CARD_HEIGHT;
weaknesses.setXY(constants.DEFAULT_SPACE, rowY);
kicks.setXY(7 * constants.DEFAULT_SPACE + 6 * constants.CARD_WIDTH, rowY);

// Third
rowY = constants.DEFAULT_SPACE * 3 + constants.CARD_HEIGHT * 2;
destroyed.setXY(constants.DEFAULT_SPACE, rowY);




players.forEach( (player, index) => {
   player.hand.isFaceUp = index == playerId;
   player.setVisible(index == playerId);
   player.superHeros.addCard(superHeros.draw());

   // Second 
   rowY = constants.DEFAULT_SPACE * 2 + constants.CARD_HEIGHT;
   player.ongoing.setXY(2 * constants.DEFAULT_SPACE + constants.CARD_WIDTH, rowY);

   // Third
   rowY = constants.DEFAULT_SPACE * 3 + constants.CARD_HEIGHT * 2;
   player.workArea.setXY(2 * constants.DEFAULT_SPACE + constants.CARD_WIDTH, rowY);
   player.superHeros.setXY(7 * constants.DEFAULT_SPACE + 6 * constants.CARD_WIDTH, rowY);

   // Fourth row
   rowY = constants.DEFAULT_SPACE * 4 + constants.CARD_HEIGHT * 3;
   player.discard.setXY(constants.DEFAULT_SPACE, rowY);
   player.hand.setXY(2 * constants.DEFAULT_SPACE + constants.CARD_WIDTH, rowY);
   player.deck.setXY(7 * constants.DEFAULT_SPACE + 6 * constants.CARD_WIDTH, rowY);

   player.deck.shuffle();
   player.drawHand();
   player.hand.adjustCards();
   player.deck.adjustCards();
   player.discard.adjustCards();
   player.ongoing.adjustCards();
   player.superHeros.adjustCards();
   player.workArea.adjustCards();
});

// Attatch event Listeners after setup
let mouseDownEvt: MouseEvent;
let cardClicked: Card;
let fieldFrom: CardContainer;

function touchStart(event: any) {
   // Need to get 
   // 1) the card
   // 2) the field From
   mouseDownEvt = event;

   let eles = document.elementsFromPoint(event.clientX, event.clientY);
   let possibleCard = eles.find( x=> x.className === "card");
   let possibleField = eles.find( x=> x.className === "field");

   if (possibleCard && possibleField){
      cardClicked = cardIndex[parseInt(possibleCard.id)]
      fieldFrom = fieldIndex[parseInt(possibleField.id)]
      cardClicked.element.classList.add('notransition')
   }
}

function touchMove(event: any) {
      
   if(mouseDownEvt && cardClicked && isDragEvent(mouseDownEvt, event)) {
      cardClicked.element.style.transform = "translate(" + ( cardClicked.x - mouseDownEvt.pageX + event.pageX ) + "px," + ( cardClicked.y - mouseDownEvt.pageY + event.pageY ) + "px)";         
   }
}

function touchEnd(event: any) {
   if ( mouseDownEvt && cardClicked ) {

   cardClicked.element.classList.remove('notransition')

   if(isDragEvent(mouseDownEvt, event)) {
         let clientX = event.clientX || event.touches[0].clientX;
         let clientY = event.clientY || event.touches[0].clientY;

            let eles = document.elementsFromPoint(clientX, clientY);
            let possibleField = eles.find( x=> x.className === "field");
            if (possibleField) {
               let fieldTo = fieldIndex[parseInt(possibleField.id)]
               // Move card from one field to another.
               if (fieldFrom != fieldTo){
                  fieldTo.addCard(fieldFrom.take(cardClicked.id))
               } else {
                  cardClicked.element.style.transform = "translate(" + ( cardClicked.x ) + "px," + ( cardClicked.y ) + "px)";
               }
            } else {
               cardClicked.element.style.transform = "translate(" + ( cardClicked.x ) + "px," + ( cardClicked.y ) + "px)";
            }
      } else {
            console.log('clicked on card:' + cardClicked.cardInfo.CardName);
            showCardText(cardClicked.getText());
      }   
   }
   mouseDownEvt = null;
   cardClicked = null;
}

table.addEventListener('mousedown', (event) => {
   touchStart(event);
});
table.addEventListener('mousemove', (event) => {
   touchMove(event);
});
table.addEventListener('mouseup', (event) => {
   touchEnd(event);
});
table.addEventListener('touchstart', (event) => {
   touchStart(event);
   event.preventDefault();
});
table.addEventListener('touchmove', (event) => {
   touchMove(event);
   event.preventDefault();
});
table.addEventListener('touchend', (event) => {
   touchEnd(event);
   event.preventDefault();
});

table.ondragstart = function() { return false; };

function isDragEvent(event1: any, event2: any) {
   let clientX1 = event1.clientX || event1.touches[0].clientX;
   let clientY1 = event1.clientY || event1.touches[0].clientY;
   let clientX2 = event2.clientX || event2.touches[0].clientX;
   let clientY2 = event2.clientY || event2.touches[0].clientY;
   return (
      Math.abs(clientX1 - clientX2) > 5 || 
      Math.abs(clientY1 - clientY2) > 5 );
}

let nextPlayerButton = document.getElementById("next-player");
let previousPlayerButton = document.getElementById("previous-player");

nextPlayerButton.addEventListener('click', () => {
   shownPlayersId = (shownPlayersId + 1) % players.length;
   players.forEach( (player, index) => {
      player.setVisible(index === shownPlayersId);
   })
})

previousPlayerButton.addEventListener('click', () => {
   shownPlayersId = (shownPlayersId - 1) % players.length;
   players.forEach( (player, index) => {
      player.setVisible(index === shownPlayersId);
   })
})

function showCardText(text : string) : void {
   (document.getElementById("event-log") as HTMLTextAreaElement).value = text;
}

