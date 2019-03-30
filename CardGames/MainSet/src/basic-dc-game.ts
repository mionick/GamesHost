/** This serves as the entry point for the game. */
import { Card } from "./card";
import { constants } from "./constants";
import { Deck } from "./deck";
import { Field } from "./field";
import { CardInfo } from "./card-info";
import { Player } from "./player";
import { CardContainer } from "./card-container";
import { ShuffleTrigger } from "./shuffle-trigger";

// CARD_LIST  defined as global object in assets/cards.js, loaded by index.html before this is run.
declare var CARD_LIST: CardInfo[];

let mod = function(m: number, n: number) {
   return ((m%n)+n)%n;
   }

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

let fieldIndex: CardContainer[] = [];

let weaknesses = new Deck(true, table, fieldIndex, "Weakness Stack");
let kicks = new Deck(true, table, fieldIndex, "Kick Stack");
let mainDeck = new Deck(false, table, fieldIndex, "Main Deck");
let destroyed = new Deck(true, table, fieldIndex, "Destroyed Pile");
let villains = new Deck(false, table, fieldIndex, "Super Villains Deck");
let lineup = new Field(true, table, fieldIndex, "Line-Up");
let superHeros = new Deck(true, table, fieldIndex, "Super Heros Deck");
superHeros.setVisible(false);
destroyed.element.id = "destroyed"

//TODO: Host will listen for reistrations, 
// choose who is playing, send back id, store ids in local storage in case refresh
// and populate this list with correct names.

let playerNames = ["Nick", "Joel", "Qasim"];

let playerId = 0; // TODO: this will be assigned by the host once the game starts.
// Determines whose field is currently being displayed.
let shownPlayersId = playerId;

let players: Player[] = [];
playerNames.forEach((name, id) => {
   players.push(new Player(table, fieldIndex, name, id));
});


// Provides an ordered lookup of every card created.
let cardIndex: Card[] = [];



// CARD_LIST  defined as global object in assets/cards.js, loaded by index.html before this is run.
let idOffset = 0;
CARD_LIST.forEach((cardInfo) => {
   // Need to go through each card and assign it to the correct deck.

   // idOffset + idx will guarantee unique id, even when creating more than one of same card.
   if (cardInfo.CardName === constants.CARD_NAMES.KICK) {
      for (let i = 0; i < constants.NUM_KICKS; i++) {
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
            for (let i = 0; i < constants.NUM_WEAKNESSES; i++) {
               let card = new Card(idOffset, cardInfo, table);
               weaknesses.addCard(card);
               cardIndex.push(card);
               idOffset++;
            }
            break;
         }
         case constants.CARD_TYPES.STARTER: {
            if (cardInfo.CardName === constants.CARD_NAMES.PUNCH) {
               players.forEach(player => {
                  for (let i = 0; i < constants.NUM_PUNCHES; i++) {
                     let card = new Card(idOffset, cardInfo, table);
                     player.deck.addCard(card);
                     cardIndex.push(card);
                     idOffset++;
                  }
               });

            }
            else if (cardInfo.CardName === constants.CARD_NAMES.VULNERABILITY) {
               players.forEach(player => {
                  for (let i = 0; i < constants.NUM_VULNERABILITIES; i++) {
                     let card = new Card(idOffset, cardInfo, table);
                     player.deck.addCard(card);
                     cardIndex.push(card);
                     idOffset++;
                  }
               });
            }
         }
         default: {
            for (let i = 0; i < Number.parseInt(cardInfo.Copies || "0"); i++) {
               let card = new Card(idOffset, cardInfo, table);
               mainDeck.addCard(card);
               cardIndex.push(card);
               idOffset++;
            }
         }
      }
   }
});


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

let shuffleButton = new ShuffleTrigger(
   -constants.CARD_WIDTH / 4,
   rowY - constants.CARD_WIDTH / 4,
   constants.CARD_WIDTH / 2,
   table
)




players.forEach((player, index) => {
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

// Game Starts
mainDeck.shuffle();
villains.shuffle();
superHeros.shuffle();
lineup.addCard(mainDeck.draw());
lineup.addCard(mainDeck.draw());
lineup.addCard(mainDeck.draw());
lineup.addCard(mainDeck.draw());
lineup.addCard(mainDeck.draw());

lineup.adjustCards();
villains.adjustCards();
villains.addCardToTop(villains.searchAndTake(constants.STARTING_VILLAIN))
villains.cards[0].setFaceUp();

mainDeck.adjustCards();
weaknesses.adjustCards();
kicks.adjustCards();

// utility methods

function isDragEvent(event1: any, event2: any) {
   let clientX1 = event1.clientX || event1.touches[0].clientX;
   let clientY1 = event1.clientY || event1.touches[0].clientY;
   let clientX2 = event2.clientX || event2.touches[0].clientX;
   let clientY2 = event2.clientY || event2.touches[0].clientY;
   return (
      Math.abs(clientX1 - clientX2) > 5 ||
      Math.abs(clientY1 - clientY2) > 5);
}

let nextPlayerButton = document.getElementById("next-player");
let previousPlayerButton = document.getElementById("previous-player");

nextPlayerButton.addEventListener('click', () => {
   shownPlayersId = mod((shownPlayersId + 1), players.length);
   players.forEach((player, index) => {
      player.setVisible(index === shownPlayersId);
   })
   shuffleButton.setVisible(shownPlayersId === playerId);

})

previousPlayerButton.addEventListener('click', () => {
   shownPlayersId = mod((shownPlayersId - 1), players.length);
   players.forEach((player, index) => {
      player.setVisible(index === shownPlayersId);
   })
   shuffleButton.setVisible(shownPlayersId === playerId);
})

document.getElementById("vp-count").addEventListener('click', (event) => {
   event.srcElement.textContent = "VP: " + players[playerId].getVP();
})

function showCardText(text: string): void {
   (document.getElementById("card-text") as HTMLParagraphElement).textContent = text;
}

function getTouchedField(x: number, y: number): CardContainer {
   let field: CardContainer = null;
   // Search for the ONE field that was clicked on, if any.
   for (let i = 0; i < fieldIndex.length && !field; i++) {
      if (fieldIndex[i].isVisible() && fieldIndex[i].contains(x, y)) {
         field = fieldIndex[i];
      }
   }
   return field;
}



function getTouchedCard(x: number, y: number): Card {
   let card: Card = null;
   // Search for the ONE field that was clicked on, if any.
   for (let i = 0; i < fieldIndex.length && !card; i++) {
      if (fieldIndex[i].isVisible()) {
         card = fieldIndex[i].getTouchedCard(x, y);
      }
   }
   return card;
}

function addToSelected(...cards: Card[]) {
   // check if it was a long press
   cards.forEach((card: Card) => {
      card.element.classList.add("selected-card");
      selectedCards.add(card);
   })

}

function deselectAll(): void {
   selectedCards.forEach(card => {
      card.element.classList.remove("selected-card");
   })
   selectedCards.clear()
}

let mouseDownEvtForButton: MouseEvent;

// ============================= EVENT LISTENERS FOR ACTION BUTTONS ==============================

function startTouchingActionButton(event: any) {

   mouseDownEvtForButton = event;
   shuffleButton.element.classList.add('notransition')
   event.stopPropagation();


}
shuffleButton.element.addEventListener("mousedown", startTouchingActionButton);

// ================================== EVENT LISTENERS FOR CARDS ==================================

let mouseDownEvt: MouseEvent;
let cardClicked: Card;
let selectedCards = new Set<Card>();
let isDrag = false;

function doubleTap(event: MouseEvent) {
   cardClicked = getTouchedCard(event.clientX - table.getBoundingClientRect().left, event.clientY - table.getBoundingClientRect().top);

   if (cardClicked) {
      cardClicked.isFaceUp ? cardClicked.setFaceDown() : cardClicked.setFaceUp();
   }
}

function touchStart(event: any) {

   // Need to get 
   // 1) the card
   // 2) the field From
   mouseDownEvt = event;
   isDrag = false;

   cardClicked = getTouchedCard(event.clientX - table.getBoundingClientRect().left, event.clientY - table.getBoundingClientRect().top);

   if (!selectedCards.has(cardClicked)) {
      deselectAll();
   }

   if (cardClicked) {
      addToSelected(cardClicked);
      cardClicked.element.classList.add('notransition')
   }

   setTimeout(() => {
      if (mouseDownEvt && !isDrag) {
         selectedCards.clear();
         addToSelected(...cardClicked.field.cards);
      }
   }, 600);
}

function touchMove(event: any) {

   if (mouseDownEvtForButton) {
      shuffleButton.element.style.transform = "translate(" + (shuffleButton.x - mouseDownEvtForButton.pageX + event.pageX) + "px," + (shuffleButton.y - mouseDownEvtForButton.pageY + event.pageY) + "px)";
   }

   if (mouseDownEvt && cardClicked) {
      if (isDragEvent(mouseDownEvt, event)) {
         cardClicked.element.style.transform = "translate(" + (cardClicked.x - mouseDownEvt.pageX + event.pageX) + "px," + (cardClicked.y - mouseDownEvt.pageY + event.pageY) + "px)";
         isDrag = true;
      }
   }
}

function touchEnd(event: any) {

   //Ending Action For Buttons
   if (mouseDownEvtForButton) {
      shuffleButton.element.classList.remove('notransition')
      shuffleButton.element.style.transform = "translate(" + (shuffleButton.x) + "px," + (shuffleButton.y) + "px)";
      let fieldTo = getTouchedField(event.clientX - table.getBoundingClientRect().left, event.clientY - table.getBoundingClientRect().top);
      if (fieldTo instanceof Deck) {
         fieldTo.shuffle();
      }
      mouseDownEvtForButton = null;
   }

   // Ending Action for Cards
   if (mouseDownEvt && cardClicked) {

      cardClicked.element.classList.remove('notransition')

      if (isDrag) {
         let clientX = event.clientX || event.touches[0].clientX;
         let clientY = event.clientY || event.touches[0].clientY;

         let fieldTo = getTouchedField(event.clientX - table.getBoundingClientRect().left, event.clientY - table.getBoundingClientRect().top);

         if (fieldTo) {
            // Move card from one field to another.
            if (cardClicked.field != fieldTo) {
               if (selectedCards.has(cardClicked)) {
                  // Put all selected cards there
                  selectedCards.forEach(card => {
                     fieldTo.addCard(card.field.take(card.id))
                  })
                  deselectAll();

               } else {
                  // put just that card.
                  fieldTo.addCard(cardClicked.field.take(cardClicked.id))
               }
            } else {
               cardClicked.element.style.transform = "translate(" + (cardClicked.x) + "px," + (cardClicked.y) + "px)";
            }
         } else {
            cardClicked.element.style.transform = "translate(" + (cardClicked.x) + "px," + (cardClicked.y) + "px)";
         }
      } else {
         console.log('clicked on card:' + cardClicked.cardInfo.CardName);
         showCardText(cardClicked.getText());
      }
   }
   mouseDownEvt = null;
   cardClicked = null;
}

// TODO: not sure if needed. come back when doing mobile events
table.ondragstart = function () { return false; };

table.addEventListener('mousedown', (event) => {
   touchStart(event);
});
table.addEventListener('dblclick', (event) => {
   doubleTap(event);
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