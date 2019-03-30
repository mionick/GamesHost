/** This serves as the entry point for the game. */
import { Card } from "./card";
import { constants } from "./constants";
import { Deck } from "./deck";
import { Field } from "./field";
import { CardInfo } from "./card-info";
import { Player } from "./player";
import { CardContainer } from "./card-container";
import { ShuffleTrigger } from "./shuffle-trigger";
import { GameEvent, EventType, GameStartEvent, CardsMovedEvent, CardFlippedEvent, DeckShuffledEvent, PlayerRequestEvent } from "./event";

// CARD_LIST  defined as global object in assets/cards.js, loaded by index.html before this is run.
declare var CARD_LIST: CardInfo[];
// constants are set based on the size of the screen on start.
constants.initialize();

// Array of event handlers, where index is eventtype enum value
let EVENT_HANDLERS: ((event: GameEvent) => void)[] = [];

let useMock = true;
let baseUrl = "";
let pastEvents: GameEvent[] = [];

//TODO: Host will listen for registrations, 
// choose who is playing, send back id, store ids in local storage in case refresh
// and populate this list with correct names.

let machineIdToName = new Map<number, string>();
// the clients that were actually chosen to play the game
let machineIds: number[] = [];

let playerId: number = null; 
let displayName: string = ""; // set by entering name before game starts

// Determines whose field is currently being displayed.
let shownPlayersId: number = null;
let players: Player[] = [];

// Use timestamp as id, it should be pretty unique. Used to identify player.
// TODO: save in session storage?
let machineId = getTimeStamp();

// Provides an ordered lookup of every card created.
let cardIndex: Card[] = [];
let fieldIndex: CardContainer[] = [];

let table = document.getElementById("table");

// Used for testing without wifi
let eventsMockedSet: GameEvent[] = [
   new PlayerRequestEvent("Nick", machineId),
   new PlayerRequestEvent("Player 2", machineId + 1),
   new PlayerRequestEvent("Player 3", machineId + 2),
   new GameStartEvent([machineId, machineId + 2]),
   new CardsMovedEvent(0, 0, [70])
];


//This will be the same for everyone, can be done immediately.
// Need to initialize players during game start though
let weaknesses = new Deck(true, table, fieldIndex, "Weakness Stack");
let kicks = new Deck(true, table, fieldIndex, "Kick Stack");
let mainDeck = new Deck(false, table, fieldIndex, "Main Deck");
let destroyed = new Deck(true, table, fieldIndex, "Destroyed Pile");
let villains = new Deck(false, table, fieldIndex, "Super Villains Deck");
let lineup = new Field(true, table, fieldIndex, "Line-Up");
let superHeros = new Deck(true, table, fieldIndex, "Super Heros Deck");
superHeros.setVisible(false);
destroyed.element.id = "destroyed"

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




// ============================= GAME EVENTS =============================
// gets recent events, does not process them. Can be mocked.
// returns: event[] 
let getEvent = async function (events: GameEvent[]) {

   let url = baseUrl + "api/event/?event=" + events.length;
   let response = await fetch(url);//, { mode: 'no-cors'});
   console.log(response);

   let responseEvents = (await response.json()) as GameEvent[];

   // Expecting to recieve an array with at least one event.
   console.log(response);

   responseEvents.forEach(event => {
      events.push(event);
   })

   return responseEvents;
}

// Mocked version.
// event[]
async function getEventMock(events: GameEvent[]) {
   // sleep then add the next event. 
   await sleep(500); // ms
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

EVENT_HANDLERS[EventType.PlayerRequestEvent] = function (event: GameEvent): void {
   let evt = event as PlayerRequestEvent;
   machineIdToName.set(evt.machineId, evt.name);
   logEvent(evt.name + " Requested to join the game.");
   logEvent("")
   
}
EVENT_HANDLERS[EventType.GameStartEvent] = function (event: GameEvent): void {
   
   machineIds = (event as GameStartEvent).machineIds;
   
   machineIds.forEach((macId, id) => {
      players.push(new Player(table, fieldIndex, machineIdToName.get(macId), id));
   });
   
   // determine what our id is based on the gamestart event
   playerId = machineIds.indexOf(machineId);
   shownPlayersId = Math.max(playerId, 0);

   // CARD_LIST  defined as global object in assets/cards.js, loaded by index.html before this is run.
   CARD_LIST.forEach((cardInfo) => {
      // Need to go through each card and assign it to the correct deck.

      // cardIndex.length will guarantee unique id, even when creating more than one of same card.
      if (cardInfo.CardName === constants.CARD_NAMES.KICK) {
         for (let i = 0; i < constants.NUM_KICKS; i++) {
            let card = new Card(cardIndex.length, cardInfo, table);
            kicks.addCard(card);
            cardIndex.push(card);

         }
      } else {
         switch (cardInfo.CardType) {
            case constants.CARD_TYPES.SUPER_HERO: {
               // TODO: these cards are bigger. but they actually look fine at normal size. 
               let card = new Card(cardIndex.length, cardInfo, table);
               superHeros.addCard(card);
               cardIndex.push(card);

               break;
            }
            case constants.CARD_TYPES.SUPER_VILLAIN: {
               let card = new Card(cardIndex.length, cardInfo, table);
               villains.addCard(card);
               cardIndex.push(card);

               break;
            }
            case constants.CARD_TYPES.WEAKNESS: {
               for (let i = 0; i < constants.NUM_WEAKNESSES; i++) {
                  let card = new Card(cardIndex.length, cardInfo, table);
                  weaknesses.addCard(card);
                  cardIndex.push(card);

               }
               break;
            }
            case constants.CARD_TYPES.STARTER: {
               if (cardInfo.CardName === constants.CARD_NAMES.PUNCH) {
                  players.forEach(player => {
                     for (let i = 0; i < constants.NUM_PUNCHES; i++) {
                        let card = new Card(cardIndex.length, cardInfo, table);
                        player.deck.addCard(card);
                        cardIndex.push(card);

                     }
                  });

               }
               else if (cardInfo.CardName === constants.CARD_NAMES.VULNERABILITY) {
                  players.forEach(player => {
                     for (let i = 0; i < constants.NUM_VULNERABILITIES; i++) {
                        let card = new Card(cardIndex.length, cardInfo, table);
                        player.deck.addCard(card);
                        cardIndex.push(card);

                     }
                  });
               }
            }
            default: {
               for (let i = 0; i < Number.parseInt(cardInfo.Copies || "0"); i++) {
                  let card = new Card(cardIndex.length, cardInfo, table);
                  mainDeck.addCard(card);
                  cardIndex.push(card);

               }
            }
         }
      }
   });

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
   villains.cards[0].setFaceUp(true);

   mainDeck.adjustCards();
   weaknesses.adjustCards();
   kicks.adjustCards();

   logEvent("GAME STARTED!")
   logEvent("")


}
EVENT_HANDLERS[EventType.CardsMovedEvent] = function (event: GameEvent): void {
   let evt = event as CardsMovedEvent;
   logEvent(players[evt.playerId].name + " Moved " + evt.cardIds.length + " card(s) to " + fieldIndex[evt.fieldToId].name);
   
   // This only works because I enforce all selected cards are from the same field.
   // Move all without adjusting
   evt.cardIds.forEach( cardId => {
      fieldIndex[evt.fieldToId].addCard(cardIndex[cardId].field.take(cardId), false);
      logEvent(cardIndex[cardId].cardInfo.CardName);
   })
   // adjust after
   fieldIndex[evt.fieldToId].adjustCards();
   cardIndex[0].field.adjustCards();
   logEvent("")


}
EVENT_HANDLERS[EventType.CardFlippedEvent] = function (event: GameEvent): void {
   let evt = event as CardFlippedEvent;
   logEvent(players[evt.playerId].name + " Flipped card: " + cardIndex[evt.cardId].cardInfo.CardName);
   cardIndex[evt.cardId].setFaceUp(evt.faceUp);
   logEvent("")

}
EVENT_HANDLERS[EventType.DeckShuffledEvent] = function (event: GameEvent): void {
   let evt = event as DeckShuffledEvent;
   logEvent(players[evt.playerId].name + " Shuffled deck: " + fieldIndex[evt.fieldId].name);

   // build new deck list.
   let cards: Card[] = [];
   evt.cardOrder.forEach(cardId => {
      cards.push(cardIndex[cardId]);
   })

   fieldIndex[evt.fieldId].cards = cards;
   fieldIndex[evt.fieldId].adjustCards();
   logEvent("")

}

/**
 * This method should block and handle each event passed to it sequentially.
 * Once it completes the next event will be fetched, so the ui has to be ready.
 * @param {the event} event 
 */
async function handleEvents(eventsArray: GameEvent[]) {
   // All events have a type
   // use this to select the handler.
   for(let i = 0; i < eventsArray.length; i++) {
      let event = eventsArray[i];
      if (EVENT_HANDLERS[event.type]) {
         await EVENT_HANDLERS[event.type](event);
      }
   }

}


// ============================= utility methods =============================

let mod = function (m: number, n: number) {
   return ((m % n) + n) % n;
}
function getTimeStamp() {
   return window.performance.timing.navigationStart + window.performance.now();
}
function sleep(ms: number) {
   return new Promise(resolve => setTimeout(resolve, ms));
}
function logEvent(text: string) {
   console.log(text);
}
function sendEvent(event: GameEvent) {
   eventsMockedSet.push(event);
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


function isDragEvent(xy1: Point, xy2: Point) {

   return (
      Math.abs(xy1.x - xy2.x) > 5 ||
      Math.abs(xy1.y - xy1.y) > 5);
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

// ============================= EVENT LISTENERS FOR ACTION BUTTONS ==============================
let firstContactForShuffleButton: Point;

function startTouchingActionButton(event: MouseEvent) {
   firstContactForShuffleButton = new Point(event.clientX - table.getBoundingClientRect().left, event.clientY - table.getBoundingClientRect().top);
   shuffleButton.element.classList.add('notransition')
   event.stopPropagation();
}
function startTouchingActionButtonByTouch(event: TouchEvent) {
   firstContactForShuffleButton = new Point(event.changedTouches[0].clientX - table.getBoundingClientRect().left, event.changedTouches[0].clientY - table.getBoundingClientRect().top);
   shuffleButton.element.classList.add('notransition')
   event.stopPropagation();
   event.preventDefault();
}

shuffleButton.element.addEventListener("mousedown", startTouchingActionButton);
shuffleButton.element.addEventListener("touchstart", startTouchingActionButtonByTouch, false);

// ================================== EVENT LISTENERS FOR CARDS ==================================
class Point {
   constructor(
   public x: number,
   public y: number
   ){

   }
}
let firstContact: Point;
let cardClicked: Card;
let selectedCards = new Set<Card>();
let isDrag = false;

function doubleTap(xy: Point) {
   cardClicked = getTouchedCard(xy.x, xy.y);

   if (cardClicked) {
      // cardClicked.setFaceUp(!cardClicked.isFaceUp)
      sendEvent(new CardFlippedEvent(
         playerId,
         cardClicked.id,
         !cardClicked.isFaceUp
      ))
   }
}

function touchStart(xy: Point) {

   // Need to get 
   // 1) the card
   // 2) the field From
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
      if (firstContact && !isDrag) {
         selectedCards.clear();
         addToSelected(...cardClicked.field.cards);
      }
   }, 600);
}

function touchMove(xy: Point) {

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

function touchEnd(xy: Point) {

   //Ending Action For Buttons
   if (firstContactForShuffleButton) {
      shuffleButton.element.classList.remove('notransition')
      shuffleButton.element.style.transform = "translate(" + (shuffleButton.x) + "px," + (shuffleButton.y) + "px)";
      let fieldTo = getTouchedField(xy.x, xy.y);
      if (fieldTo instanceof Deck) {
         fieldTo.shuffle();
         sendEvent(new DeckShuffledEvent(
            playerId, 
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
                     playerId,
                     fieldTo.id,
                     Array.from(selectedCards, (card) => { return card.id})
                  ))
                  deselectAll();

               } else {
                  // put just that card.
                  // fieldTo.addCard(cardClicked.field.take(cardClicked.id))
                  sendEvent(new CardsMovedEvent(
                     playerId,
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
         console.log('clicked on card:' + cardClicked.cardInfo.CardName);
         showCardText(cardClicked.getText());
      }
   }
   firstContact = null;
   cardClicked = null;
}

// TODO: not sure if needed. come back when doing mobile events
table.ondragstart = function () { return false; };

table.addEventListener('mousedown', (event) => {
   touchStart(new Point(event.clientX - table.getBoundingClientRect().left, event.clientY - table.getBoundingClientRect().top));
});
table.addEventListener('dblclick', (event) => {
   doubleTap(new Point(event.clientX - table.getBoundingClientRect().left, event.clientY - table.getBoundingClientRect().top));
});
table.addEventListener('mousemove', (event) => {
   touchMove(new Point(event.clientX - table.getBoundingClientRect().left, event.clientY - table.getBoundingClientRect().top));
});
table.addEventListener('mouseup', (event) => {
   touchEnd(new Point(event.clientX - table.getBoundingClientRect().left, event.clientY - table.getBoundingClientRect().top));
});


table.addEventListener('touchstart', function(e){
   var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
   touchStart(new Point(touchobj.clientX - table.getBoundingClientRect().left, touchobj.clientY - table.getBoundingClientRect().top))
   e.preventDefault()
}, false)

table.addEventListener('touchmove', function(e){
   var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
   touchMove(new Point(touchobj.clientX - table.getBoundingClientRect().left, touchobj.clientY - table.getBoundingClientRect().top))
   e.preventDefault()
}, false)
table.addEventListener('touchend', function(e){
   var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
   touchEnd(new Point(touchobj.clientX - table.getBoundingClientRect().left, touchobj.clientY - table.getBoundingClientRect().top))
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

   while (true) {
      let eventSet = await getEvent(pastEvents);
      await handleEvents(eventSet); // handle the event that was just added
   }
}


mainLoop();
