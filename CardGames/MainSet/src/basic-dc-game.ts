/** This serves as the entry point for the game. */
import { Card } from "./card";
import { constants } from "./constants";
import { Deck } from "./deck";
import { Field } from "./field";
import { CardInfo } from "./card-info";
import { Player } from "./player";
import { CardContainer } from "./card-container";
import { ShuffleTrigger } from "./shuffle-trigger";
import { GameEvent, EventType, GameStartEvent, CardsMovedEvent, CardFlippedEvent, DeckShuffledEvent, PlayerRequestEvent, HostRequestEvent } from "./event";
import { DrawFiveTrigger } from "./draw-five-trigger";

// CARD_LIST  defined as global object in assets/cards.js, loaded by index.html before this is run.
declare var CARD_LIST: CardInfo[];
// constants are set based on the size of the screen on start.
constants.initialize();

// Array of event handlers, where index is eventtype enum value
let EVENT_HANDLERS: ((event: GameEvent) => void)[] = [];

let useMock = false;
let baseUrl = "";
let pastEvents: GameEvent[] = [];

//TODO: Host will listen for registrations, 
// choose who is playing, send back id, store ids in local storage in case refresh
// and populate this list with correct names.

let machineIdToName = new Map<number, string>();
// the clients that were actually chosen to play the game
let machineIds: number[] = [];

let playerId: number = null;
let hostMachineId: number = null;

// Determines whose field is currently being displayed.
let shownPlayersId: number = null;
let players: Player[] = [];

// Use timestamp as id, it should be pretty unique. Used to identify player.
// TODO: save in session storage?
let machineId = getMachineId();

// Provides an ordered lookup of every card created.
let cardIndex: Card[] = [];
let punches: Card[] = [];
let vulnerabilities: Card[] = [];
let fieldIndex: CardContainer[] = [];

let table = document.getElementById("table");

let punch_info: CardInfo;
let vulnerability_info: CardInfo;

// Used for testing without wifi
let eventsMockedSet: GameEvent[] = [];

//    new PlayerRequestEvent("Nick", machineId),
//    new PlayerRequestEvent("Player 2", machineId + 1),
//    new PlayerRequestEvent("Player 3", machineId + 2),
//    new GameStartEvent([machineId, machineId + 2], [133, 132]),
//    new CardsMovedEvent(0, 0, [70])
// ];


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
         // Hard coded 6 here is max number of players
         case constants.CARD_TYPES.STARTER: {
            if (cardInfo.CardName === constants.CARD_NAMES.PUNCH) {
               punch_info = cardInfo;
               for (let i = 0; i < constants.NUM_PUNCHES*6; i++) {
                  let card = new Card(cardIndex.length, punch_info, table);
                  punches.push(card);
                  cardIndex.push(card);
               }
            }
            else if (cardInfo.CardName === constants.CARD_NAMES.VULNERABILITY) {
               vulnerability_info = cardInfo;
               for (let i = 0; i < constants.NUM_VULNERABILITIES * 6; i++) {
                  let card = new Card(cardIndex.length, vulnerability_info, table);
                  vulnerabilities.push(card);
                  cardIndex.push(card);
               }
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

   let url = baseUrl + "api/event/?event=" + events.length;
   let response = await fetch(url).catch(obj => {
      console.log("error in fetch for getEvnt")
      console.log(obj);
      return obj;
   });//, { mode: 'no-cors'});
   console.log(response);


   // Expecting to recieve an array with at least one event.
   let responseEvents = (await response.json()) as GameEvent[];
   console.log(responseEvents);

   responseEvents.forEach(event => {
      events.push(event);
   })

   return responseEvents;
}
let includedPlayers = new Map<number, number>();

function getPlayerChooser(macId: number, name: string): HTMLElement {
   let pcEl = document.createElement("div");
   // creating checkbox element 
   var checkbox = document.createElement('input');

   // Assigning the attributes 
   // to created checkbox 
   checkbox.type = "checkbox";
   checkbox.name = "name";
   checkbox.value = "value";
   checkbox.id = "id";

   // creating label for checkbox 
   var label = document.createElement('label');

   // assigning attributes for  
   // the created label tag  
   label.htmlFor = "id";

   // appending the created text to  
   // the created label tag  
   label.appendChild(document.createTextNode(name));

   // appending the checkbox 
   // and label to div 
   pcEl.appendChild(checkbox);
   pcEl.appendChild(label);

   let heroChooser = getHeroChooser() as HTMLSelectElement;
   heroChooser.addEventListener("change", function (event) {
      if (includedPlayers.has(macId)) {
         includedPlayers.set(macId, parseInt((this as any).value));
      }
   });
   checkbox.addEventListener('change', function () {
      if (this.checked) {
         includedPlayers.set(macId, parseInt(heroChooser.options[heroChooser.selectedIndex].value));
      } else {
         includedPlayers.delete(macId);
      }
   });


   pcEl.appendChild(heroChooser);


   return pcEl;
}

function getHeroChooser(): HTMLElement {
   //Create and append select list
   let selectList = document.createElement("select");
   selectList.id = "mySelect";

   //Create and append the options
   for (var i = 0; i < superHeros.cards.length; i++) {
      var option = document.createElement("option");
      option.value = superHeros.cards[i].id + "";
      option.text = superHeros.cards[i].cardInfo.CardName;
      selectList.appendChild(option);
   }

   return selectList;
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
let hostSection = document.getElementById("host-section");


EVENT_HANDLERS[EventType.PlayerRequestEvent] = function (event: GameEvent): void {
   let evt = event as PlayerRequestEvent;
   machineIdToName.set(evt.machineId, evt.name);
   // disable button if were already registered.
   if (evt.machineId === machineId) {
      (document.getElementById("player-btn") as HTMLButtonElement).disabled = true;
   }
   logEvent(evt.name + " Requested to join the game.");
   logEvent("")

   hostSection.appendChild(getPlayerChooser(evt.machineId, evt.name))

}
let afterGameStartCallback: (() => void) = null;
EVENT_HANDLERS[EventType.GameStartEvent] = function (event: GameEvent): void {

   // For this event, the first time the host is here they have already sent out the shuffle events to put the cards in the correct order.
   // After that, even if we are the host we want to act the same?
   // Then this event won't trigger other events. perfect.

   //TODO: remove shuffle from here.
   // Put that in the game start button click

   let evt = (event as GameStartEvent);
   machineIds = evt.machineIds;

   machineIds.forEach((macId, id) => {
      players.push(new Player(table, fieldIndex, machineIdToName.get(macId), id));
   });


   // determine what our id is based on the gamestart event
   playerId = machineIds.indexOf(machineId);
   console.log("setting id to: " + playerId);
   console.log("Our Machine id is " + machineId);
   console.log("Our Machine id mod 100000000 is " + mod(machineId, 100000000));

   shownPlayersId = Math.max(playerId, 0);

   players.forEach((player, index) => {
      // Fill their deck
      // TODO: its okay to create cards here, but they need to shuffle after...
      // Solution is to create enough starter cards for everyone before hand.
      // Then can asume the cards are used in order to fill deck

      // TODO: dont create cards, just take
      for (let i = 0; i < constants.NUM_PUNCHES; i++) {
         player.deck.addCard(punches[ i + constants.NUM_PUNCHES * index]);
      }

      for (let i = 0; i < constants.NUM_VULNERABILITIES; i++) {
         player.deck.addCard(vulnerabilities[i + constants.NUM_VULNERABILITIES * index]);
      }

      player.hand.isFaceUp = index === playerId;
      player.setVisible(index === shownPlayersId);
      player.superHeros.addCard(cardIndex[evt.heroIds[index]]);

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


      player.drawHand();
      player.hand.adjustCards();
      player.deck.adjustCards();
      player.discard.adjustCards();
      player.ongoing.adjustCards();
      player.superHeros.adjustCards();
      player.workArea.adjustCards();
   });

   lineup.adjustCards();
   villains.adjustCards();
   villains.cards[0].setFaceUp(true);

   mainDeck.adjustCards();
   weaknesses.adjustCards();
   kicks.adjustCards();

   document.getElementById("registration-page").style.display = "none";

   if (afterGameStartCallback) {
      afterGameStartCallback();
   }


   logEvent("GAME STARTED!")
   logEvent("")


}
EVENT_HANDLERS[EventType.CardsMovedEvent] = function (event: GameEvent): void {
   let evt = event as CardsMovedEvent;
   let name = evt.playerId >= 0 && players[evt.playerId] ? players[evt.playerId].name : "Host";
   logEvent(name + " Moved " + evt.cardIds.length + " card(s) to " + fieldIndex[evt.fieldToId].name);

   // This only works because I enforce all selected cards are from the same field.
   // Move all without adjusting
   evt.cardIds.forEach(cardId => {
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
   let name = evt.playerId >= 0 && players[evt.playerId] ? players[evt.playerId].name : "Host";
   
   logEvent(name + " Flipped card: " + cardIndex[evt.cardId].cardInfo.CardName);
   cardIndex[evt.cardId].setFaceUp(evt.faceUp);
   logEvent("")

}
EVENT_HANDLERS[EventType.DeckShuffledEvent] = function (event: GameEvent): void {
   let evt = event as DeckShuffledEvent;
   let name = evt.playerId >= 0 && players[evt.playerId] ? players[evt.playerId].name : "Host";
   
   logEvent(name + " Shuffled deck: " + fieldIndex[evt.fieldId].name);

   // build new deck list.
   let cards: Card[] = [];
   evt.cardOrder.forEach(cardId => {
      cards.push(cardIndex[cardId]);
   })

   fieldIndex[evt.fieldId].cards = cards;
   fieldIndex[evt.fieldId].adjustCards();
   logEvent("")

}
EVENT_HANDLERS[EventType.HostRequestEvent] = function (event: GameEvent): void {
   let evt = event as HostRequestEvent;
   // Make sure host has not already been chosen.
   if (!hostMachineId) {
      hostMachineId = evt.machineId;
      (document.getElementById("host-btn") as HTMLButtonElement).disabled = true;
      if (machineId === hostMachineId) {
         // we are the host
         hostSection.style.display = "block";
      }
   }
   // Others should just wait until game start now.
}

/**
 * This method should block and handle each event passed to it sequentially.
 * Once it completes the next event will be fetched, so the ui has to be ready.
 * @param {the event} event 
 */
async function handleEvents(eventsArray: GameEvent[]) {
   // All events have a type
   // use this to select the handler.
   for (let i = 0; i < eventsArray.length; i++) {
      let event = eventsArray[i];
      console.log("Event: " + (EventType[event.type]))
      if (EVENT_HANDLERS[event.type]) {
         await EVENT_HANDLERS[event.type](event);
      }
   }

}


// ============================= utility methods =============================

let mod = function (m: number, n: number) {
   return ((m % n) + n) % n;
}
function getMachineId(): number {
   let string = navigator.vendorSub + navigator.appVersion + navigator.appCodeName + navigator.platform + navigator.hardwareConcurrency + navigator.userAgent;
   let numbers = string.match(/\d+/g).map(Number);
   return parseInt(numbers.join(""));
}
function sleep(ms: number) {
   return new Promise(resolve => setTimeout(resolve, ms));
}
let eventLog = document.getElementById("event-log") as HTMLTextAreaElement;
function logEvent(text: string) {
   //console.log(text);
   eventLog.value += "\n" + text;
   eventLog.scrollTop = eventLog.scrollHeight;
}
async function sendEvent(event: GameEvent) {
   if (useMock) {
      eventsMockedSet.push(event);
   } else {
      await fetch(baseUrl + 'api/event/',
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
   shownPlayersId = mod((shownPlayersId + 1), players.length);
   players.forEach((player, index) => {
      player.setVisible(index === shownPlayersId);
   })
   shuffleButton.setVisible(shownPlayersId === playerId);
   draw5Trigger.setVisible(shownPlayersId === playerId);

})

previousPlayerButton.addEventListener('click', () => {
   shownPlayersId = mod((shownPlayersId - 1), players.length);
   players.forEach((player, index) => {
      player.setVisible(index === shownPlayersId);
   })
   shuffleButton.setVisible(shownPlayersId === playerId);
   draw5Trigger.setVisible(shownPlayersId === playerId);

})

document.getElementById("vp-count").addEventListener('click', (event) => {
   event.srcElement.textContent = "VP: " + players[playerId].getVP();
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
   if (playerId === shownPlayersId) {
      let cards = players[playerId].deck.cards.slice(0, 5);
      if (cards.length > 0) {
         sendEvent(new CardsMovedEvent(
            playerId,
            players[playerId].hand.id,
            Array.from(cards, (card) => { return card.id })
         ))
      }
   }
   event.stopPropagation();
}

draw5Trigger.element.addEventListener( "touchend", () => {
   if (playerId === shownPlayersId) {
      let cards = players[playerId].deck.cards.slice(0, 5);
      if (cards.length > 0) {
         sendEvent(new CardsMovedEvent(
            playerId,
            players[playerId].hand.id,
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

   if (machineId === hostMachineId) {

      // we shuffle
      // TODO: host is also going to recieve these events. thats stupid but works.
      mainDeck.shuffle();
      // These need to send in the correct order. must await.
      await sendEvent(new DeckShuffledEvent(
         null,
         mainDeck.id,
         Array.from(mainDeck.cards, (card) => card.id)
      ));
      villains.shuffle();
      villains.addCardToTop(villains.searchAndTake(constants.STARTING_VILLAIN));
      await sendEvent(new DeckShuffledEvent(
         null,
         villains.id,
         Array.from(villains.cards, (card) => card.id)
         ));
         

      lineup.addCard(mainDeck.draw());
      lineup.addCard(mainDeck.draw());
      lineup.addCard(mainDeck.draw());
      lineup.addCard(mainDeck.draw());
      lineup.addCard(mainDeck.draw());
      await sendEvent(new CardsMovedEvent(
         null,
         lineup.id,
         Array.from(lineup.cards, card => card.id)
      ))

      // Players dont exist yet, event for us.
      // Need to actually do this after the game start event, so useing a callback only defined here.
      afterGameStartCallback = () => {
         players.forEach((player, index) => {
            // we shuffle
            player.deck.shuffle();
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
         playerId,
         cardClicked.id,
         !cardClicked.isFaceUp
      ))
      cardClicked.setFaceUp(!cardClicked.isFaceUp)
   }
}

function isDoubleTap(recentTouches : Contact[]) {
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
      if (firstContact && recentTouches[1] === xy && !isDrag) {
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
                     Array.from(selectedCards, (card) => { return card.id })
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
         await handleEvents(eventSet); // handle the event that was just added
      }
      console.log('exited');

   } catch (error) {
      console.log(error);
   }
}


mainLoop();
