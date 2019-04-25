/** This serves as the entry point for the game. */
import { Card } from "./card";
import { constants } from "./constants";
import { Deck } from "./deck";
import { CardInfo } from "./card-info";
import { Player } from "./player";
import { CardContainer } from "./card-container";
import { ShuffleTrigger } from "./shuffle-trigger";
import { GameEvent, GameStartEvent, CardsMovedEvent, CardFlippedEvent, DeckShuffledEvent, PlayerRequestEvent, HostRequestEvent } from "./event";
import { DrawFiveTrigger } from "./draw-five-trigger";
import { Board } from "./board";
import { EventHandler } from "./event-handler";
import { Utilities } from "./utilities";

// CARD_LIST  defined as global object in assets/cards.js, loaded by index.html before this is run.
declare var CARD_LIST: CardInfo[];
declare var STARTING_VILLAIN: string;

// constants are set based on the size of the screen on start.
constants.initialize();

// Array of event handlers, where index is eventtype enum value

let useMock = false;
let pastEvents: GameEvent[] = [];
let players: Player[] = [];
let serverUrl = 'http://' + window.location.host;

// Use timestamp as id, it should be pretty unique. Used to identify player.
// TODO: save in session storage?
let machineId = Utilities.getMachineId();

// Provides an ordered lookup of every card created.
let cardIndex: Card[] = [];
let fieldIndex: CardContainer[] = [];

let table = document.getElementById("table");
let includedPlayers = new Map<number, number>();

// Used for testing without wifi
let eventsMockedSet: GameEvent[] = [];

let board = new Board(table, fieldIndex);
// CARD_LIST  defined as global object in assets/cards.js, loaded by index.html before this is run.
board.init(CARD_LIST, cardIndex, table);

let hostSection = document.getElementById("host-section");
let eventHandler = new EventHandler(
   machineId,
   board,
   players,
   includedPlayers,
   hostSection,
   table,
   fieldIndex,
   cardIndex
);

let shuffleButton = new ShuffleTrigger(
   -constants.CARD_WIDTH / 4,
   constants.DEFAULT_SPACE * 3 + constants.CARD_HEIGHT * 2 - constants.CARD_WIDTH / 4,
   constants.CARD_WIDTH / 2,
   table
)
let draw5Trigger = new DrawFiveTrigger(
   constants.TABLE_WIDTH - constants.CARD_WIDTH / 2,
   constants.TABLE_HEIGHT - constants.CARD_WIDTH / 2,
   constants.CARD_WIDTH / 2,
   table
)

// ============================= GAME EVENTS =============================
// gets recent events, does not process them. Can be mocked.
// returns: event[] 
let getEvent = async function (events: GameEvent[]) {

   console.log(`Sending Request for Event: ${events.length}`)

   let url = serverUrl + "/api/event/?event=" + events.length;
   let response = await fetch(url).catch(obj => {
      console.log("error in fetch for getEvent")
      console.log(obj);
      return obj;
   });//, { mode: 'no-cors'});
   console.log(response);


   // Expecting to recieve an array with at least one event.
   let responseEvents = (await response.json()) as GameEvent[];
   console.log(`Sending Request for Event: ${events.length}`)
   console.log(responseEvents);

   responseEvents.forEach(event => {
      events.push(event);
   })

   return responseEvents;
}

// Mocked version.
// event[]
async function getEventMock(events: GameEvent[]) {
   // sleep then add the next event. 
   await Utilities.sleep(500); // ms
   if (eventsMockedSet.length === events.length) {
      return [];
   }
   events.push(eventsMockedSet[events.length]);
   // weve gone through all our events
   return [eventsMockedSet[events.length - 1]];
}
if (useMock) {
   getEvent = getEventMock;
}


async function sendEvent(event: GameEvent) {
   if (useMock) {
      eventsMockedSet.push(event);
   } else {
      await fetch(serverUrl + '/api/event/',
         {
            method: 'POST',
            headers: {
               'Accept': 'application/json',
               'Content-Type': 'text/plain'
            },
            //mode: 'no-cors',
            body: JSON.stringify(event)
         }
      ).then(response => {
         console.log("sendEvent response:")
         console.log(response)
      }).catch(obj => {
         console.log("error in fetch for sendEvent")
         console.log(obj);
      });//, { mode: 'no-cors'});
   }
}

/** x and y must be offsets from the table top left corner. */
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

/** x and y must be offsets from the table top left corner. */
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

// ============================= JAVASCRIPT EVENTS =============================


function isDragEvent(xy1: Contact, xy2: Contact) {

   return (
      Math.abs(xy1.x - xy2.x) > 3 ||
      Math.abs(xy1.y - xy1.y) > 3);
}

let nextPlayerButton = document.getElementById("next-player");
let previousPlayerButton = document.getElementById("previous-player");

nextPlayerButton.addEventListener('click', () => {
   eventHandler.shownPlayersId = Utilities.mod((eventHandler.shownPlayersId + 1), players.length);
   players.forEach((player, index) => {
      player.setVisible(index === eventHandler.shownPlayersId);
   })
   shuffleButton.setVisible(eventHandler.shownPlayersId === eventHandler.playerId);
   draw5Trigger.setVisible(eventHandler.shownPlayersId === eventHandler.playerId);

})

previousPlayerButton.addEventListener('click', () => {
   eventHandler.shownPlayersId = Utilities.mod((eventHandler.shownPlayersId - 1), players.length);
   players.forEach((player, index) => {
      player.setVisible(index === eventHandler.shownPlayersId);
   })
   shuffleButton.setVisible(eventHandler.shownPlayersId === eventHandler.playerId);
   draw5Trigger.setVisible(eventHandler.shownPlayersId === eventHandler.playerId);

})

document.getElementById("vp-count").addEventListener('click', (event) => {
   event.srcElement.textContent = "VP: " + players[eventHandler.playerId].getVP();
})

function showCardText(text: string): void {
   (document.getElementById("card-text") as HTMLParagraphElement).textContent = text;
}

// ============================= EVENT LISTENERS FOR ACTION BUTTONS ==============================
let firstContactForShuffleButton: Contact;

function startTouchingActionButton(event: MouseEvent) {
   firstContactForShuffleButton = new Contact(event.clientX - table.getBoundingClientRect().left, event.clientY - table.getBoundingClientRect().top);
   shuffleButton.element.classList.add('notransition')
   event.stopPropagation();
}
function startTouchingActionButtonByTouch(event: TouchEvent) {
   firstContactForShuffleButton = new Contact(event.changedTouches[0].clientX - table.getBoundingClientRect().left, event.changedTouches[0].clientY - table.getBoundingClientRect().top);
   shuffleButton.element.classList.add('notransition')
   event.stopPropagation();
   event.preventDefault();
}

shuffleButton.element.addEventListener("mousedown", startTouchingActionButton);
shuffleButton.element.addEventListener("touchstart", startTouchingActionButtonByTouch, false);


draw5Trigger.element.onclick = () => {
   if (eventHandler.playerId === eventHandler.shownPlayersId) {
      let cards = players[eventHandler.playerId].deck.cards.slice(0, 5);
      if (cards.length > 0) {
         sendEvent(new CardsMovedEvent(
            eventHandler.playerId,
            players[eventHandler.playerId].hand.id,
            Array.from(cards, (card) => { return card.id })
         ))
      }
   }
   event.stopPropagation();
}

draw5Trigger.element.addEventListener("touchend", () => {
   if (eventHandler.playerId === eventHandler.shownPlayersId) {
      let cards = players[eventHandler.playerId].deck.cards.slice(0, 5);
      if (cards.length > 0) {
         sendEvent(new CardsMovedEvent(
            eventHandler.playerId,
            players[eventHandler.playerId].hand.id,
            Array.from(cards, (card) => { return card.id })
         ))
      }
   }
   event.stopPropagation();
   event.preventDefault();
},
   false);




(document.getElementById("host-btn") as HTMLButtonElement).onclick = () => {
   sendEvent(new HostRequestEvent(machineId));
}
(document.getElementById("start-btn") as HTMLButtonElement).onclick = async () => {
   // Game Starts
   // Host must have been decided at this point.
   // They also must have selected the correct players to play.
   // Each player can shuffle their own deck? since they have to have decks before this can happen

   if (machineId === eventHandler.hostMachineId) {

      // we shuffle
      // TODO: host is also going to recieve these events. thats stupid but works.
      board.mainDeck.shuffle();
      // These need to send in the correct order. must await.
      board.lineup.addCard(board.mainDeck.draw());
      board.lineup.addCard(board.mainDeck.draw());
      board.lineup.addCard(board.mainDeck.draw());
      board.lineup.addCard(board.mainDeck.draw());
      board.lineup.addCard(board.mainDeck.draw());
      
      await sendEvent(new DeckShuffledEvent(
         null,
         board.mainDeck.id,
         Array.from(board.mainDeck.cards, (card) => card.id)
      ));

      await sendEvent(new CardsMovedEvent(
         null,
         board.lineup.id,
         Array.from(board.lineup.cards, card => card.id)
      ))


      board.villains.shuffle();
      board.villains.addCardToTop(board.villains.searchAndTake(STARTING_VILLAIN));
      await sendEvent(new DeckShuffledEvent(
         null,
         board.villains.id,
         Array.from(board.villains.cards, (card) => card.id)
      ));



      // Players dont exist yet, event for us.
      // Need to actually do this after the game start event, so useing a callback only defined here.
      eventHandler.afterGameStartCallback = () => {
         players.forEach((player, index) => {
            // we shuffle
            player.deck.shuffle();
            player.drawHand();
            sendEvent(new CardsMovedEvent(
               null,
               player.hand.id,
               Array.from(player.hand.cards, card => card.id)
            ))
            player.hand.adjustCards();
            sendEvent(new DeckShuffledEvent(
               null,
               player.deck.id,
               Array.from(player.deck.cards, (card) => card.id)
            ))
         })
      }
      await sendEvent(new GameStartEvent(
         Array.from(includedPlayers.keys()),
         Array.from(includedPlayers.values())
      ));


   }
}
(document.getElementById("player-btn") as HTMLButtonElement).onclick = () => {
   let displayName = (document.getElementById("name-ipt") as HTMLInputElement).value;
   if (displayName && displayName.length > 0) {
      sendEvent(new PlayerRequestEvent(displayName, machineId));
      (document.getElementById("player-btn") as HTMLButtonElement).disabled = true;
      (document.getElementById("name-ipt") as HTMLInputElement).disabled = true;
   }
}



// ================================== EVENT LISTENERS FOR CARDS ==================================
class Contact {
   constructor(
      public x: number,
      public y: number,
      public time: any = 0 // timestamp
   ) {

   }
}

let recentTouches: Contact[] = [null, null];
let firstContact: Contact = null;
let cardClicked: Card;
let selectedCards = new Set<Card>();
let isDrag = false;

function doubleTap(xy: Contact) {
   cardClicked = getTouchedCard(xy.x, xy.y);

   if (cardClicked) {
      // cardClicked.setFaceUp(!cardClicked.isFaceUp)
      sendEvent(new CardFlippedEvent(
         eventHandler.playerId,
         cardClicked.id,
         !cardClicked.isFaceUp
      ))
      cardClicked.setFaceUp(!cardClicked.isFaceUp)
   }
}

function isDoubleTap(recentTouches: Contact[]) {
   let c1 = recentTouches[0];
   let c2 = recentTouches[1];

   return (
      c1 &&
      c2 &&
      !isDragEvent(c1, c2) &&
      c2.time - c1.time < 600
   );


}


function touchStart(xy: Contact) {

   // Need to get 
   // 1) the card
   // 2) the field From

   // These are used to detect double tap.
   recentTouches.push(xy);
   recentTouches.shift();

   if (isDoubleTap(recentTouches)) {
      doubleTap(recentTouches[1]);
      return;
   }

   firstContact = xy;
   isDrag = false;

   cardClicked = getTouchedCard(xy.x, xy.y);

   if (!selectedCards.has(cardClicked)) {
      deselectAll();
   }

   if (cardClicked) {
      addToSelected(cardClicked);
      cardClicked.element.classList.add('notransition')
   }

   setTimeout(() => {
      if (firstContact && cardClicked && recentTouches[1] === xy && !isDrag) {
         selectedCards.clear();
         addToSelected(...cardClicked.field.cards);
      }
   }, 600);
}

function touchMove(xy: Contact) {

   if (firstContactForShuffleButton) {
      shuffleButton.element.style.transform = "translate(" + (shuffleButton.x - firstContactForShuffleButton.x + xy.x) + "px," + (shuffleButton.y - firstContactForShuffleButton.y + xy.y) + "px)";
   }

   if (firstContact && cardClicked) {
      if (isDragEvent(firstContact, xy)) {
         cardClicked.element.style.transform = "translate(" + (cardClicked.x - firstContact.x + xy.x) + "px," + (cardClicked.y - firstContact.y + xy.y) + "px)";
         isDrag = true;
      }
   }
}

function touchEnd(xy: Contact) {

   //Ending Action For Buttons
   if (firstContactForShuffleButton) {
      shuffleButton.element.classList.remove('notransition')
      shuffleButton.element.style.transform = "translate(" + (shuffleButton.x) + "px," + (shuffleButton.y) + "px)";
      let fieldTo = getTouchedField(xy.x, xy.y);
      if (fieldTo instanceof Deck) {
         fieldTo.shuffle();
         sendEvent(new DeckShuffledEvent(
            eventHandler.playerId,
            fieldTo.id,
            Array.from(fieldTo.cards, (card) => card.id)
         ))
      }
      firstContactForShuffleButton = null;
   }

   // Ending Action for Cards
   if (firstContact && cardClicked) {

      cardClicked.element.classList.remove('notransition')

      if (isDrag) {

         let fieldTo = getTouchedField(xy.x, xy.y);

         if (fieldTo) {
            // Move card from one field to another.
            if (cardClicked.field != fieldTo) {
               if (selectedCards.has(cardClicked)) {
                  // Put all selected cards there
                  // selectedCards.forEach(card => {
                  //    fieldTo.addCard(card.field.take(card.id, false), false)
                  // })
                  // this only works because I enforce all selected cards are from the same field.
                  // cardClicked.field.adjustCards();
                  // fieldTo.adjustCards();
                  sendEvent(new CardsMovedEvent(
                     eventHandler.playerId,
                     fieldTo.id,
                     Array.from(selectedCards, (card) => { return card.id })
                  ))
                  deselectAll();

               } else {
                  // put just that card.
                  // fieldTo.addCard(cardClicked.field.take(cardClicked.id))
                  sendEvent(new CardsMovedEvent(
                     eventHandler.playerId,
                     fieldTo.id,
                     [cardClicked.id]
                  ))
               }
            } else {
               cardClicked.element.style.transform = "translate(" + (cardClicked.x) + "px," + (cardClicked.y) + "px)";
            }
         } else {
            cardClicked.element.style.transform = "translate(" + (cardClicked.x) + "px," + (cardClicked.y) + "px)";
         }
      } else {
         //console.log('clicked on card:' + cardClicked.cardInfo.CardName);
         showCardText(cardClicked.getText());
      }
   }
   firstContact = null;
   cardClicked = null;
}

// TODO: not sure if needed. come back when doing mobile events
table.ondragstart = function () { return false; };

table.addEventListener('mousedown', (event) => {
   touchStart(new Contact(event.clientX - table.getBoundingClientRect().left, event.clientY - table.getBoundingClientRect().top, event.timeStamp));
});
table.addEventListener('mousemove', (event) => {
   touchMove(new Contact(event.clientX - table.getBoundingClientRect().left, event.clientY - table.getBoundingClientRect().top));
});
table.addEventListener('mouseup', (event) => {
   touchEnd(new Contact(event.clientX - table.getBoundingClientRect().left, event.clientY - table.getBoundingClientRect().top));
});


table.addEventListener('touchstart', function (e) {
   var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
   touchStart(new Contact(touchobj.clientX - table.getBoundingClientRect().left, touchobj.clientY - table.getBoundingClientRect().top, e.timeStamp))
   e.preventDefault()
}, false)

table.addEventListener('touchmove', function (e) {
   var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
   touchMove(new Contact(touchobj.clientX - table.getBoundingClientRect().left, touchobj.clientY - table.getBoundingClientRect().top))
   e.preventDefault()
}, false)
table.addEventListener('touchend', function (e) {
   var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
   touchEnd(new Contact(touchobj.clientX - table.getBoundingClientRect().left, touchobj.clientY - table.getBoundingClientRect().top))
   e.preventDefault()
}, false)


// ACTUAL GAME START
// ========================================================= MAIN =========================================================


// Logic:
/*
If game has not started, need to display a place to enter name and join button.
Once joined, display "Waiting for Host to start game"
Start requesting events here - everything is event based 
- keep track of events that have gone by
- can replay at the end for fun

*/
async function mainLoop() {

   try {
      while (true) {
         let eventSet = await getEvent(pastEvents);
         await eventHandler.handleEvents(eventSet); // handle the event that was just added
      }
      console.log('exited');

   } catch (error) {
      console.error("Should not have left the while true loop");
      console.error(error);
   }
}


mainLoop();
