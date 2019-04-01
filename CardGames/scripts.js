// Used to replicate past games
let useMock = true;

// ================================ CONSTANTS ===============================================

const CARD_PADDING_X = 20; //pixels;



// ================================ GLOBALS ===============================================

let baseUrl = '';//'http://192.168.2.134:1337/'; 

let registrationElement = document.getElementById('registration');
let nameElement = document.getElementById('name');

let eventMessageElement = document.getElementById('event-message');
let ipAddressElement = document.getElementById('ip-address');

// false before the game starts and after it ends
let gameOn = false;
// Used to decide when to start drawing the board
let gameStartTime = -1;
// true only after the game is over.
let gameEnded = false;
let pastEvents = [];
let username = '';
let identifier = ''; // TODO:Unused but SHOULD be done later. Probably with another game.
let gameAlreadyStarted = false; // Inidicate if we are a late joiner.



let EVENT_HANDLERS = {
	GAME_START: null,
	GAME_END: null,
	NO_SETS: null,
	CARDS_ADDED: null,
	CORRECT_SET: null,
	INCORRECT_SET: null,
	// THESE EVENTS ARE NOT THROWN BY THE GAME, BUT BY THE SERVER
	PLAYER_JOINED: null,
	KICKED_OUT: null, // TODO: Does not happen right now
	JOINED_SUCCESSFULLY: null,
	GAME_IN_PROGRESS: null,
	NAME_TAKEN: null, // TODO: android host doesn't count right now, there should be a player management system keeping track
	CONNECTION: null, // Not thrown during game, only used to get ip addresses for sharing. 
}

const NON_GAME_EVENTS = [
	'PLAYER_JOINED',
	'KICKED_OUT',
	'JOINED_SUCCESSFULLY',
	'NAME_TAKEN',
	'CONNECTION',
	'GAME_IN_PROGRESS'
]


// ========================================================= SETUP =========================================================
async function getStripes() {
	PATTERNS;

	await getStripeImageData(ctx, COLORS[0], CARD_BACKGROUNDCOLOR).then(
		function (results) {
			PATTERNS[0] = results;
		}
	);
	await getStripeImageData(ctx, COLORS[1], CARD_BACKGROUNDCOLOR).then(
		function (results) {
			PATTERNS[1] = results;
		}
	);
	await getStripeImageData(ctx, COLORS[2], CARD_BACKGROUNDCOLOR).then(
		function (results) {
			PATTERNS[2] = results;
		}
	);
}

getStripes();

// compare canvas aspect ratio to windows aspect ratio, and set max appropriately.
if ((canvas.width / canvas.height) > (window.innerWidth / window.innerHeight)) {
	canvas.style.width = '100vw';
	canvas.style.height = 'auto';
} else {
	canvas.style.width = 'auto';
	canvas.style.height = '100vh';
}
window.addEventListener('resize', function () {
	if ((canvas.width / canvas.height) > (window.innerWidth / window.innerHeight)) {
		canvas.style.width = '100vw';
		canvas.style.height = 'auto';
	} else {
		canvas.style.width = 'auto';
		canvas.style.height = '100vh';
	}
}, true);

window.addEventListener('load', function () {
	this.setTimeout(function () {
		window.scrollTo(0, 1);
	}, 0);
});


(async function getIPs() {
	// get the ip addresses and display them at the bottom of the screen
	let url = baseUrl + "api/connection/";
	let response = await fetch(url);//, { mode: 'no-cors'});
	console.log(response);
	response = await response.json();

	ipAddressElement.innerHTML = '<p>Wifi IP: ' + response.params[0] + '</p><p>Hotspot IP: ' + response.params[1] + '</p>'

})();

nameElement.addEventListener("keyup", function (event) {
	// Cancel the default action, if needed
	event.preventDefault();
	// Number 13 is the "Enter" key on the keyboard
	if (event.keyCode === 13) {
		// Trigger the button element with a click
		sendName();
	}
});

if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
	nameElement.addEventListener('focus', function () {
		// replace CSS font-size with 16px to disable auto zoom on iOS
		nameElement.style.fontSize = '16px';
	});
	nameElement.addEventListener('blur', function () {
		// put back the CSS font-size
		setTimeout(function () {
			nameElement.style.fontSize = '';
		})
	});
}

document.getElementById('display-options-chk').addEventListener('change', function () {
	if (this.checked) {
		// Checkbox is checked..
		scorecardElement.style.display = 'block';
		ipAddressElement.style.display = 'block';
	} else {
		// Checkbox is not checked..
		scorecardElement.style.display = 'none';
		ipAddressElement.style.display = 'none';
	}
});


// document.getElementById('zoom-lock-chk').addEventListener('change', function () {
// 	if (this.checked) {
// 		// Checkbox is checked..
// 		var meta = document.createElement('meta');
// 		meta.id = "fixed-scroll";
// 		meta.name = "viewport";
// 		meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
// 		document.getElementsByTagName('head')[0].appendChild(meta);
// 	} else {
// 		// Checkbox is not checked..
// 		let elem = document.getElementById("fixed-scroll");
//  		elem.parentElement.removeChild(elem);
// 	}
// });



// ======================================== MOCKED DATA =======================================
let eventsMockedSet = [{ "params": ["Nick"], "timestamp": 374237572688799, "type": "PLAYER_JOINED" }, { "params": [{ "deck": [{ "array": [4, 4, 1, 2], "features": 4, "values": 3 }, { "array": [2, 4, 4, 1], "features": 4, "values": 3 }, { "array": [1, 1, 4, 2], "features": 4, "values": 3 }, { "array": [4, 4, 4, 4], "features": 4, "values": 3 }, { "array": [1, 1, 2, 4], "features": 4, "values": 3 }, { "array": [2, 2, 2, 4], "features": 4, "values": 3 }, { "array": [1, 1, 2, 1], "features": 4, "values": 3 }, { "array": [2, 2, 4, 4], "features": 4, "values": 3 }, { "array": [1, 4, 4, 1], "features": 4, "values": 3 }, { "array": [2, 4, 1, 4], "features": 4, "values": 3 }, { "array": [1, 1, 1, 2], "features": 4, "values": 3 }, { "array": [4, 4, 2, 4], "features": 4, "values": 3 }, { "array": [1, 1, 4, 1], "features": 4, "values": 3 }, { "array": [4, 4, 1, 4], "features": 4, "values": 3 }, { "array": [2, 2, 1, 1], "features": 4, "values": 3 }, { "array": [4, 1, 2, 4], "features": 4, "values": 3 }, { "array": [1, 2, 2, 1], "features": 4, "values": 3 }, { "array": [4, 1, 4, 2], "features": 4, "values": 3 }, { "array": [2, 2, 2, 1], "features": 4, "values": 3 }, { "array": [2, 4, 2, 4], "features": 4, "values": 3 }, { "array": [4, 4, 4, 2], "features": 4, "values": 3 }, { "array": [1, 4, 4, 2], "features": 4, "values": 3 }, { "array": [1, 4, 4, 4], "features": 4, "values": 3 }, { "array": [4, 4, 2, 2], "features": 4, "values": 3 }, { "array": [1, 1, 1, 1], "features": 4, "values": 3 }, { "array": [1, 1, 2, 2], "features": 4, "values": 3 }, { "array": [2, 1, 2, 1], "features": 4, "values": 3 }, { "array": [4, 2, 1, 2], "features": 4, "values": 3 }, { "array": [1, 4, 2, 2], "features": 4, "values": 3 }, { "array": [4, 4, 1, 1], "features": 4, "values": 3 }, { "array": [1, 2, 1, 2], "features": 4, "values": 3 }, { "array": [1, 2, 4, 4], "features": 4, "values": 3 }, { "array": [1, 2, 1, 4], "features": 4, "values": 3 }, { "array": [1, 2, 2, 2], "features": 4, "values": 3 }, { "array": [4, 2, 4, 2], "features": 4, "values": 3 }, { "array": [4, 4, 2, 1], "features": 4, "values": 3 }, { "array": [2, 1, 1, 4], "features": 4, "values": 3 }, { "array": [2, 4, 4, 4], "features": 4, "values": 3 }, { "array": [2, 1, 1, 2], "features": 4, "values": 3 }, { "array": [4, 1, 4, 4], "features": 4, "values": 3 }, { "array": [1, 1, 4, 4], "features": 4, "values": 3 }, { "array": [1, 2, 4, 2], "features": 4, "values": 3 }, { "array": [4, 2, 2, 4], "features": 4, "values": 3 }, { "array": [4, 2, 2, 1], "features": 4, "values": 3 }, { "array": [1, 2, 1, 1], "features": 4, "values": 3 }, { "array": [2, 4, 1, 2], "features": 4, "values": 3 }, { "array": [2, 4, 4, 2], "features": 4, "values": 3 }, { "array": [2, 2, 4, 1], "features": 4, "values": 3 }, { "array": [2, 2, 2, 2], "features": 4, "values": 3 }, { "array": [1, 4, 1, 1], "features": 4, "values": 3 }, { "array": [2, 1, 4, 2], "features": 4, "values": 3 }, { "array": [2, 4, 2, 1], "features": 4, "values": 3 }, { "array": [4, 2, 4, 4], "features": 4, "values": 3 }, { "array": [4, 1, 4, 1], "features": 4, "values": 3 }, { "array": [1, 4, 1, 2], "features": 4, "values": 3 }, { "array": [1, 4, 2, 1], "features": 4, "values": 3 }, { "array": [2, 1, 4, 1], "features": 4, "values": 3 }, { "array": [4, 2, 1, 4], "features": 4, "values": 3 }, { "array": [4, 1, 1, 4], "features": 4, "values": 3 }, { "array": [4, 2, 1, 1], "features": 4, "values": 3 }, { "array": [4, 2, 2, 2], "features": 4, "values": 3 }, { "array": [4, 2, 4, 1], "features": 4, "values": 3 }, { "array": [4, 1, 2, 1], "features": 4, "values": 3 }, { "array": [4, 1, 1, 1], "features": 4, "values": 3 }, { "array": [2, 1, 4, 4], "features": 4, "values": 3 }, { "array": [2, 4, 1, 1], "features": 4, "values": 3 }, { "array": [1, 2, 4, 1], "features": 4, "values": 3 }, { "array": [2, 2, 1, 4], "features": 4, "values": 3 }, { "array": [1, 2, 2, 4], "features": 4, "values": 3 }, { "array": [4, 4, 4, 1], "features": 4, "values": 3 }, { "array": [2, 2, 1, 2], "features": 4, "values": 3 }, { "array": [1, 4, 2, 4], "features": 4, "values": 3 }, { "array": [2, 1, 2, 2], "features": 4, "values": 3 }, { "array": [2, 1, 2, 4], "features": 4, "values": 3 }, { "array": [1, 4, 1, 4], "features": 4, "values": 3 }, { "array": [4, 1, 1, 2], "features": 4, "values": 3 }, { "array": [2, 4, 2, 2], "features": 4, "values": 3 }, { "array": [2, 1, 1, 1], "features": 4, "values": 3 }, { "array": [1, 1, 1, 4], "features": 4, "values": 3 }, { "array": [4, 1, 2, 2], "features": 4, "values": 3 }, { "array": [2, 2, 4, 2], "features": 4, "values": 3 }], "deckIndex": 27, "random": { "haveNextNextGaussian": false, "nextNextGaussian": 0.0, "seed": 260168943079259 } }], "timestamp": 374241813500620, "type": "GAME_START" }, { "params": ["nick", [{ "array": [1, 1, 2, 4], "features": 4, "values": 3 }, { "array": [2, 2, 2, 4], "features": 4, "values": 3 }, { "array": [4, 4, 2, 4], "features": 4, "values": 3 }], [4, 5, 11]], "timestamp": 374253950554522, "type": "CORRECT_SET" }, { "params": [[{ "array": [1, 1, 4, 1], "features": 4, "values": 3 }, { "array": [4, 4, 1, 4], "features": 4, "values": 3 }, { "array": [2, 2, 1, 1], "features": 4, "values": 3 }]], "timestamp": 374253972614262, "type": "CARDS_ADDED" }, { "params": ["nick", [{ "array": [4, 4, 1, 4], "features": 4, "values": 3 }, { "array": [1, 1, 1, 2], "features": 4, "values": 3 }, { "array": [2, 2, 1, 1], "features": 4, "values": 3 }], [5, 10, 11]], "timestamp": 374258812883947, "type": "CORRECT_SET" }, { "params": [[{ "array": [4, 1, 2, 4], "features": 4, "values": 3 }, { "array": [1, 2, 2, 1], "features": 4, "values": 3 }, { "array": [4, 1, 4, 2], "features": 4, "values": 3 }]], "timestamp": 374258828112958, "type": "CARDS_ADDED" }, { "params": ["nick", [{ "array": [2, 2, 4, 4], "features": 4, "values": 3 }, { "array": [1, 4, 4, 1], "features": 4, "values": 3 }, { "array": [4, 1, 4, 2], "features": 4, "values": 3 }], [7, 8, 11]], "timestamp": 374270443168214, "type": "CORRECT_SET" }, { "params": [[{ "array": [2, 2, 2, 1], "features": 4, "values": 3 }, { "array": [2, 4, 2, 4], "features": 4, "values": 3 }, { "array": [4, 4, 4, 2], "features": 4, "values": 3 }]], "timestamp": 374270460365089, "type": "CARDS_ADDED" }, { "params": [], "timestamp": 374270461017224, "type": "NO_SETS" }, { "params": [[{ "array": [1, 4, 4, 2], "features": 4, "values": 3 }, { "array": [1, 4, 4, 4], "features": 4, "values": 3 }, { "array": [4, 4, 2, 2], "features": 4, "values": 3 }]], "timestamp": 374270461235870, "type": "CARDS_ADDED" }, { "params": ["Nick", [{ "array": [2, 4, 4, 1], "features": 4, "values": 3 }, { "array": [4, 4, 4, 2], "features": 4, "values": 3 }, { "array": [1, 4, 4, 4], "features": 4, "values": 3 }], [1, 11, 13]], "timestamp": 374381864028067, "type": "CORRECT_SET" }, { "params": [], "timestamp": 374381867566400, "type": "NO_SETS" }, { "params": [[{ "array": [1, 1, 1, 1], "features": 4, "values": 3 }, { "array": [1, 1, 2, 2], "features": 4, "values": 3 }, { "array": [2, 1, 2, 1], "features": 4, "values": 3 }]], "timestamp": 374381867958744, "type": "CARDS_ADDED" }];


// ================================ EVENT MESSAGE TEXT ELEMENT ================================
// Display an event and keep processing passed in events until the lsit is empty. 
let textEventList = [];
let currentlyDisplayingSomething = false;

async function addEventText(text, timeoutMs) {
	// If there's nothing happening right now just do it immediately
	if (!currentlyDisplayingSomething) {
		displayEventText(text, timeoutMs);
	} else {
		textEventList.push({ text, timeoutMs });
	}
}

async function displayEventText(text, timeoutMs) {
	// If we are already displaying something, then just keep going. We'll get to it later.



	currentlyDisplayingSomething = true;
	eventMessageElement.innerText = text;
	eventMessageElement.style.display = 'block';
	// Special case of negative timeout. Don't make the text dissapear, but immediately clear it if something else comes. 
	// Ignore it if there are things in th queue
	if (timeoutMs < 0 && textEventList.length == 0) {
		currentlyDisplayingSomething = false;
	} else {
		// If there are other events in the quere then it only gets the default time.
		if (timeoutMs < 0) {
			timeoutMs = 1000;
		}
		setTimeout(disappearEvent, timeoutMs ? timeoutMs : 1000);
	}
}

function disappearEvent() {
	if (textEventList.length == 0) {
		eventMessageElement.style.display = 'none'
		currentlyDisplayingSomething = false;
	} else {
		let event = textEventList.shift();
		displayEventText(event.text, event.timeoutMs);
	}
}


// ============================================ WIRELESS COMMUNICATION ==========================================================

// returns: event[] 
getEvent = async function (events) {

	let url = baseUrl + "api/event/?event=" + events.length;
	let response = await fetch(url);//, { mode: 'no-cors'});
	console.log(response);
	response = await response.json();

	// Expecting to recieve an array with at least one event.
	console.log(response);
	for (event of response) {
		events.push(event);
	}
	return response;
}

async function sendInput(selectedCards) {
	await fetch(baseUrl + 'api/input/',
		{
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			//mode: 'no-cors',
			body: JSON.stringify({ name: username, identifier, selectedCards, timestamp: getTimeStamp() })
		}
	);
}

// event[]
async function getEventMock(events) {
	// sleep then add the next event. 
	await sleep(500); // ms
	events.push(eventsMockedSet[events.length]);
	return [eventsMockedSet[events.length - 1]];
}
if (useMock) {
	getEvent = getEventMock;
}


async function sendName() {
	// Send our name, get the response, if valid start the main loop and hide teh registration info.
	// If invalid, then we need to write that in the event area.

	fetch(baseUrl + 'api/user/',
		{
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			//mode: 'no-cors',
			body: JSON.stringify({ name: b64EncodeUnicode(nameElement.value), identifier: 'fake', timestamp: getTimeStamp() })
		}).then(
			async function (response) {
				response = await response.json();
				console.log(response);
				if (response['type'] == 'NAME_TAKEN') {
					addEventText('Name taken. Try another one.', -1);
				} else if (response.type == 'JOINED_SUCCESSFULLY') {
					addEventText('You\'re in!', -1);
					registrationElement.style.display = 'none';
					username = b64EncodeUnicode(nameElement.value);
					mainLoop();
				} else if (response.type == 'GAME_IN_PROGRESS') {
					addEventText('You must wait for the next game to start.', 1000);
					registrationElement.style.display = 'none';
					username = b64EncodeUnicode(nameElement.value);
					gameAlreadyStarted = true;
					mainLoop()
				} else {
					addEventText('Something weird happened...', -1);
				}
			}
		);
}

// ======================================= EVENT HANDLERS: ============================================

// Technically this definition should be done beore we try to use it, but we don't use it until after the user has clicked a button, so this is fine.

EVENT_HANDLERS.GAME_START = async function (event) {

	// Clear all past game events, the game ma have been restarted by the host
	let i;

	// If the game was already started and we're just catching up, then don't modify the events we got.
	// TODO: This is gross. gameAlreadyStarted is basically a parameter.
	if (gameAlreadyStarted) {
		// This will only be true once though, next time we see a new game event, we should flush everything.
		gameAlreadyStarted = false;
	} else {
		for (i = pastEvents.length - 1; i > -1; i--) {
			if (!NON_GAME_EVENTS.includes(pastEvents[i].type)) {
				pastEvents.splice(i, 1);
			}
		}
	}
	gameOn = false;
	// true only after the game is over.
	gameEnded = false;
	selectedCards = [];
	score = {};
	updateScore(score);
	currentlyDisplayedCards = event.params[0].deck.slice(0, 12);

	// Repush the start game event to keep us in sync. This was deleted above.
	pastEvents.push(event);
	// TODO: should just replace my entire array ith a call to events passing 0 as my current num

	// TODO: Make the server send a future gametime, not the current time. 
	gameStartTime = getTimeStamp() + 3000; // ms
	addEventText('3...', 1000);
	addEventText('2...', 1000);
	addEventText('1...', 1000);
	addEventText('GAME START!', 1000);
	// TODO: This would not be necessary with a render loop
	await sleep(3000);
	drawBoard(currentlyDisplayedCards);
}

EVENT_HANDLERS.GAME_END = async function (event) {
	// -100 is safe because there isn't even 100 sets int he deck, and SOMEONE should be positive. 
	let players = Object.keys(score);
	let scores = [];
	// Build our owns scores array to guarantee order matches. 
	for (player in players) {
		scores.push(score[player]);
	}
	let bestPlayer = players[maxIndex(scores)];
	addEventText('GAME OVER. ' + bestPlayer.toUpperCase() + ' WINS!', -1);
}

EVENT_HANDLERS.INCORRECT_SET = async function (event) {
	// Increment or initalize to 1 if the player wasn't in the list.
	// All players should be though...
	if (!score[event.params[0]]) {
		console.log("Player was not in the list, check the registration logic.");
	}
	score[event.params[0]] = score[event.params[0]] - 1 || -1; // The player name
	updateScore(score);
	if (username == event.params[0]) {
		addEventText('-1', 1000);
	}
}


EVENT_HANDLERS.CORRECT_SET = async function (event) {
	// Increment or initalize to 1 if the player wasn't in the list.
	// All players should be though...
	if (!score[event.params[0]]) {
		console.log("Player was not in the list, check the registration logic.");
	}
	score[event.params[0]] = score[event.params[0]] + 1 || 1; // The player name

	// If we had too many cards, just remove the selected ones, otherwise set to null.


	selectedCards = event.params[2];
	drawBoard(currentlyDisplayedCards);
	selectedCards = []; // Whatever was selected before might change, might as well clear it.  
	addEventText(b64DecodeUnicode(event.params[0]) + ' Found a Set!');

	for (index of event.params[2]) {
		currentlyDisplayedCards[index] = null;
	}
	replaceNulls();
	await sleep(500);
	drawBoard(currentlyDisplayedCards);
	updateScore(score);

	// TODO: Draw the set that they got
	// TODO: Will need to store the current card size? or just use the same card size no matter what. 

}

EVENT_HANDLERS.PLAYER_JOINED = async function (event) {
	addEventText(b64DecodeUnicode(event.params[0]) + ' joined the game.', -1);
}

function updateScore(score) {

	let players = Object.keys(score);
	let html = '';
	for (player of players) {
		html += '<dl><dt>' + b64DecodeUnicode(player) + ': </dt><dd>' + score[player] + '</dd></dl>';
	}

	html += '';
	scorecardElement.innerHTML = html;
}

// If there more than twelve cards this will rearrage them so there's no nulls.
function replaceNulls() {
	let currentBoardSize = currentlyDisplayedCards.length;
	if (currentBoardSize > DEFAULT_BOARD_SIZE) {

		// Loop through current cards except the last three
		// For each null found, use one of the last three
		let indexOfCardToUseAsReplacement = currentlyDisplayedCards.length - 1;
		let i;
		let thereWereNulls = false;
		for (i = 0; i < currentlyDisplayedCards.length - 3; i++) {
			// if we need to replace this one
			if (currentlyDisplayedCards[i] == null) {
				// Find the last card that isn't null
				while (currentlyDisplayedCards[indexOfCardToUseAsReplacement] == null) {
					indexOfCardToUseAsReplacement--;
				}
				currentlyDisplayedCards[i] = currentlyDisplayedCards[indexOfCardToUseAsReplacement];
				indexOfCardToUseAsReplacement--;
				thereWereNulls = true;
			}
		}

		// if we replaced anything then the last three cards are now null and should be removed
		if (thereWereNulls) {
			currentlyDisplayedCards.splice(currentlyDisplayedCards.length - 3, 3);
		}
	}

}

// If there are nulls it will insert in those spots, otherwise append to the end
function placeCards(cards) {
	let i;
	let thereWereNulls = false;
	let indexOfCardToUseAsReplacement = 0;
	for (i = 0; i < currentlyDisplayedCards.length; i++) {
		if (currentlyDisplayedCards[i] == null) {
			currentlyDisplayedCards[i] = cards[indexOfCardToUseAsReplacement];
			indexOfCardToUseAsReplacement++;
			thereWereNulls = true;
		}
	}

	// If we couldn't place the cards in the current size, append them
	if (!thereWereNulls) {
		for (card of cards) {
			currentlyDisplayedCards.push(card);
		}
	}
}

EVENT_HANDLERS.NO_SETS = async function (event) {
	addEventText('There were no sets, cards will be added.');
}

EVENT_HANDLERS.CARDS_ADDED = async function (event) {
	placeCards(event.params[0]);
	await sleep(500);
	drawBoard(currentlyDisplayedCards);
}


// =========================================== INPUT =================================================
function handleInput(event) {
	let touch = getRelativeCoords(event);//getCursorPosition(canvas, event);
	let indexTouched = mapTouchToCard(touch.x, touch.y, width, height, boardOffset, canvas);

	console.log(indexTouched);
	if (indexTouched == null) {
		return;
	}

	let indexInSelected = selectedCards.indexOf(indexTouched)
	if (indexInSelected < 0) {
		selectedCards.push(indexTouched);
	} else {
		selectedCards.splice(indexInSelected, 1);
	}

	if (selectedCards.length === 3) {
		sendInput(selectedCards);
		selectedCards = [];
	}

	drawBoard(currentlyDisplayedCards);
}

function getRelativeCoords(event) {
	return { x: event.offsetX, y: event.offsetY };
}

function mapTouchToCard(x, y, width, height, offset, canvas) {
	width = width * canvas.offsetWidth / canvas.width;
	offset = offset * canvas.offsetWidth / canvas.width;
	height = height * canvas.offsetHeight / canvas.height;
	console.log({ x, y, width, height, offset })
	// Pretend there's no offset to the cards, by shifting the input left
	x -= offset;

	// If they did not touch a card, return null
	if (x < 0 || x > width) {
		return null;
	}
	if (y > height) {
		return null;
	}

	// Draw the current cards
	let numCards = currentlyDisplayedCards.length;
	let rows = 3;
	let columns = numCards / rows;

	let cardWidth = (width / columns);
	let cardHeight = (height / rows);

	let column = Math.floor(x / cardWidth); //should round down.
	let row = Math.floor(y / cardHeight); //should round down.

	return column * rows + row;
}

// ========================================================= MAIN =========================================================


// Logic:
/*
IF game has not started, need to display a place to enter name and join button.
Once joined, display "Waiting for Host to start game"
Start requesting events here - everything is event based - keep track of events that have gone by - can replay at the end for fun
	// Maybe display when other players are joined.
	on player joined display that in status underneath waiting.
	gamestart will have a timestamp associated with it, display a countdown leading up to that.
	Once countdown is over display the first twelve cards
	wait for found cards events
	display in status at the bottom what has bee found, the current scores, etc... Can use HTML for this, don't have to do everything with canvas.
	ignore NO SETS
	IF CARDS ADDED display message for 1 second and try to transition screen?
	on game end display winners name, and option to replay game (0.3 seconds per event)

	Display the ip address that they are connected to as well, so they can share with other in the room
	so ip address, your name, scores, status, other player names, 	


*/
async function mainLoop() {

	drawBoard(currentlyDisplayedCards);
	while (!gameEnded) {
		let eventSet = await getEvent(pastEvents);
		await handleEvent(eventSet); // handle the event that was just added
	}
}

/**
 * This method should block and display whatever it needs to display.
 * Once it completes the next event will be fetched, so the ui has to be ready.
 * @param {the event} event 
 */
async function handleEvent(eventsArray) {
	// All events have a type
	// use this to select the handler.
	for (event of eventsArray) {
		if (EVENT_HANDLERS[event.type]) {
			await EVENT_HANDLERS[event.type](event);
		}
	}
	// TODO: Should we just make a proper render loop?
	// Then async methods make total sense. 
	// And countdowns become easier.
	// Worse for battery life though? Is that the only trade off?
	// Answer: No. Next time do that. For now this is sweet. 
	if (gameOn || (gameStartTime > 0 && getTimeStamp() > gameStartTime)) {
		gameOn = true;
		drawBoard(currentlyDisplayedCards);
	}

}



// ========================================= DISPLAY/DRAWING LOGIC =============================================================

// Assume Cards has all the cards currently being displayed
// On any event we need to redraw
function drawBoard(cards) {
	ctx.save();

	// Drawing the bakground:

	height = canvas.height;
	// Assume we are not as tall as we are wide
	width = canvas.width;

	ctx.fillStyle = BACKGROUNDCOLOR;
	drawRoundRect(ctx, 0, 0, width, height, 5, true, false);



	// Drawing the cards
	width = (height / DESIRED_ASPECT_RATIO);

	let numCards = cards.length;
	let rows = 3;
	let columns = numCards / rows;

	// adjust display width if more than the expected number of columns.
	width = (width * columns / 4.0);

	// calculate board offset, to keep centered.
	// Must be done after expanding for more cards
	boardOffset = (canvas.width - width) / 2;

	// must be done after expanding for more cards.
	let cardWidth = (width / columns);
	let cardHeight = (height / rows);

	ctx.translate(boardOffset, 0);

	let i, j;
	for (i = 0; i < columns; i++) {
		for (j = 0; j < rows; j++) {
			ctx.save();
			ctx.translate(i * cardWidth, j * cardHeight);
			drawCard(
				ctx,
				cards[i * rows + j],
				i * rows + j,
				cardWidth,
				cardHeight,
				selectedCards
			);
			ctx.restore()
		}
	}
	ctx.restore()
}

function drawShape(ctx, x, y, w, h, shapeNumber, colorNumber, fillNumber) {
	ctx.save();
	// For debugging
	// ctx.strokeStyle = '#F0F';
	// ctx.strokeRect(x, y, w, h);

	// Set the color 
	let color = COLORS[colorNumber];

	ctx.fillStyle = color;
	ctx.strokeStyle = color;

	switch (shapeNumber) {
		case OVAL: {
			drawOval(ctx, x, y, w, h);
			break;
		}
		case SQUIGGLE: {
			drawSquiggle2(ctx, x, y, w, h)
			break;
		}
		case DIAMOND: {
			drawDiamond(ctx, x, y, w, h);
			break;
		}
	}

	switch (fillNumber) {
		case EMPTY: {
			ctx.stroke();
			break;
		}
		case SOLID: {
			ctx.fill();
			break;
		}
		case STRIPED: {
			var pat = ctx.createPattern(PATTERNS[colorNumber], "repeat");
			ctx.fillStyle = pat;
			ctx.fill();
			// For squiggles the stroke does bad things because it's not actually on the squiggle but the rect aound it.
			if (shapeNumber != SQUIGGLE) {
				ctx.stroke();
			}
			break;
		}
	}
	ctx.restore();
}

function drawDiamond(context, x, y, width, height) {
	context.beginPath();

	let halfWidth = width / 2;
	let halfHeight = height / 2;
	context.moveTo(x + halfWidth, y);

	// top left edge
	context.lineTo(x, y + halfHeight);

	// bottom left edge
	context.lineTo(x + halfWidth, y + height);

	// bottom right edge
	context.lineTo(x + width, y + halfHeight);

	// closing the path automatically creates
	// the top right edge
	context.closePath();
}

function drawOval(context, x, y, width, height) {
	let centerX = x + width / 2;
	let centerY = y + height / 2;
	context.beginPath();

	context.moveTo(centerX, centerY - height / 2); // A1

	context.bezierCurveTo(
		centerX + width / 2, centerY - height / 2, // C1
		centerX + width / 2, centerY + height / 2, // C2
		centerX, centerY + height / 2); // A2

	context.bezierCurveTo(
		centerX - width / 2, centerY + height / 2, // C3
		centerX - width / 2, centerY - height / 2, // C4
		centerX, centerY - height / 2); // A1

	context.closePath();
}


// This method will draw a sin wave within the rectangle provided.
function drawSquiggle(ctx, x, y, width, height) {

	ctx.translate(x, y);
	ctx.beginPath();
	thickness = 0.2 * height; // fraction of the height.

	halfWidth = width / 2;
	halfHeight = height / 2;

	ctx.moveTo(0, halfHeight);
	ctx.arcTo(0, 0, halfWidth + thickness, height, 180, 180, true);
	//ctx.arcTo(halfWidth + thickness, 2*thickness, width - 2 * thickness, height - 2*thickness, 180, -180, true);
	ctx.lineTo(width, halfHeight);
	ctx.arcTo(halfWidth - thickness, 0, width, height, 0, 180, true);
	//ctx.arcTo(2 * thickness, 2 * thickness, halfWidth - thickness, height - 2*thickness, 0, -180, false);
	ctx.lineTo(0, halfHeight);
	ctx.closePath();

}

function drawSquiggle2(ctx, x, y, w, h) {
	// ctx.strokeRect(x, y, w, h)
	let xOffSet = 205;
	let yOffSet = 125;
	let svgHeight = 313.6;
	let svgWidth = 548.8;
	//ctx.translate(x-34, y-16);
	// Translate to put the shape in the right place
	ctx.translate(x, y);
	ctx.scale(w / svgWidth, h / svgHeight);
	// Translate after scaling because the squiggle draws in a weird place
	ctx.translate(-xOffSet, -yOffSet);
	// Set the clipping path here. Then we can just try to fill a rect and it will work.
	let path =
		new Path2D('M597.6,436.8c-86.575,0-156.8-70.224-156.8-156.8c0-43.288-35.112-78.4-78.4-78.4c-43.288,0-78.4,35.112-78.4,78.4c0,21.616-17.528,39.2-39.2,39.2c-21.672,0-39.2-17.584-39.2-39.2c0-86.576,70.224-156.8,156.8-156.8S519.2,193.424,519.2,280c0,43.288,35.112,78.4,78.399,78.4c43.288,0,78.4-35.112,78.4-78.4c0-21.616,17.528-39.2,39.2-39.2s39.2,17.584,39.2,39.2C754.4,366.576,684.176,436.8,597.6,436.8z');
	ctx.lineWidth = STROKE_WIDTH * svgHeight / h;
	ctx.stroke(path);
	ctx.lineWidth = STROKE_WIDTH;
	ctx.clip(path);
	ctx.translate(xOffSet, yOffSet);
	ctx.scale(svgWidth / w, svgHeight / h); // Set the scale back manually because a restore would destroy the clip		
	//ctx.translate(34-x, 16-y);
	ctx.translate(-x, -y);


	ctx.rect(x, y, w, h);

	// let tempCanvas = document.createElement('tempCanvas');
	// tempCanvas.width  = w;
	// tempCanvas.height = h;
	// tempCtx = tempCanvas.getContext('2d');
	// var pat=ctx.createPattern(PATTERNS[colorNumber],"repeat");
	// ctx.fillStyle=pat;
	// tempCanvas.fillRect(x, y, w, h);



}

function getStripeImageData(ctx, color1, color2) {
	let w = 20;

	var imgData = ctx.createImageData(w, 1);

	rgba1 = hexToRgbA(color1);
	rgba2 = hexToRgbA(color2);


	var i;
	for (i = 0; i < (w * 4) / 2; i += 4) {
		imgData.data[i + 0] = rgba1[0];
		imgData.data[i + 1] = rgba1[1];
		imgData.data[i + 2] = rgba1[2];
		imgData.data[i + 3] = rgba1[3];
	}
	for (i = (w * 4) / 2; i < w * 4; i += 4) {
		imgData.data[i + 0] = rgba2[0];
		imgData.data[i + 1] = rgba2[1];
		imgData.data[i + 2] = rgba2[2];
		imgData.data[i + 3] = rgba2[3];
	}
	return createImageBitmap(imgData);
}

function getStripeImageData2(color1, color2) {
	let w = 20;

	let canvas = new OffscreenCanvas(20, 1);
	let ctx = canvas.getContext('2d');

	ctx.fillStyle = color1;
	ctx.rect(0, 0, 10, 1);
	ctx.fill();
	ctx.fillStyle = color2;
	ctx.rect(10, 0, 20, 1);
	ctx.fill();

	return canvas;

}

/**
 * Draws a rounded rectangle using the current state of the canvas. 
 * If you omit the last three params, it will draw a rectangle 
 * outline with a 5 pixel border radius 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate 
 * @param {Number} width The width of the rectangle 
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
function drawRoundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke == "undefined") {
		stroke = true;
	}
	if (typeof radius === "undefined") {
		radius = 5;
	}
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();

	if (stroke) {
		ctx.stroke();
	}
	if (fill) {
		ctx.fill();
	}
}

// Need to translate before moving here.
function drawCard(ctx, card, index, cardWidth, cardHeight, selectedCards) {
	// IF NO CARDS PRESENT
	if (card == null) {
		ctx.fillStyle = '#000';
	} else {
		ctx.fillStyle = CARD_BACKGROUNDCOLOR;
	}

	drawRoundRect(
		ctx,
		CARD_PADDING_X,
		CARD_PADDING_Y,
		(cardWidth) - CARD_PADDING_X * 2,
		cardHeight - CARD_PADDING_Y * 2,
		CARD_PADDING_X, // radius
		true,
		false
	);

	if (card == null) {
		return;
	}


	// All of these should be values from 0-2
	colorIndex = Math.log2(card.array[0]);
	paintIndex = Math.log2(card.array[1]);
	shapeIndex = Math.log2(card.array[2]);
	number = Math.log2(card.array[3]);

	// split the card into 5, vertically.
	shapeHeight = cardHeight / 5;

	// draw 1-3 shapes, depending on number
	number += 1; // now it's 1-3

	//get total height of area covered by shapes
	totalArea = shapeHeight * number;
	//center that total area
	startDrawingFrom = cardHeight / 2 - totalArea / 2;

	let i;
	for (i = 0; i < number; i++) {
		drawShape(
			ctx,

			SHAPE_PADDING_X,
			startDrawingFrom + shapeHeight * i + SHAPE_PADDING_Y,
			(cardWidth) - SHAPE_PADDING_X * 2,
			shapeHeight - SHAPE_PADDING_Y * 2,

			shapeIndex,
			colorIndex,
			paintIndex
		);
	}


	// Draw the outline in the correct color:
	// Black if normal, yellow if selected, grey if hinted.

	if (selectedCards.includes(index)) {
		ctx.strokeStyle = '#EE0';
	} else {
		ctx.strokeStyle = '#000';
	}

	// DRAW BORDER
	drawRoundRect(
		ctx,
		CARD_PADDING_X,
		CARD_PADDING_Y,
		(cardWidth) - CARD_PADDING_X * 2,
		cardHeight - CARD_PADDING_Y * 2,
		CARD_PADDING_X, // radius
		false,
		true
	);
}

// ======================================= UTILITY FUNCTIONS ======================================= 
function hexToRgbA(hex) {
	var c;
	if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
		c = hex.substring(1).split('');
		if (c.length == 3) {
			c = [c[0], c[0], c[1], c[1], c[2], c[2]];
		}
		c = '0x' + c.join('');
		return [(c >> 16) & 255, (c >> 8) & 255, c & 255, 255];
	}
	throw new Error('Bad Hex');
}
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
function getTimeStamp() {
	return TS = window.performance.timing.navigationStart + window.performance.now();
}


function maxIndex(array) {
	return array.reduce(
		(bestIndexSoFar, currentlyTestedValue, currentlyTestedIndex, array) => {
			return currentlyTestedValue > array[bestIndexSoFar] ? currentlyTestedIndex : bestIndexSoFar
		},
		0 // pass zero as the first index to check, otherwise it passes the VALUE of the first element.
	);
}


function b64EncodeUnicode(str) {
	// first we use encodeURIComponent to get percent-encoded UTF-8,
	// then we convert the percent encodings into raw bytes which
	// can be fed into btoa.
	return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
		function toSolidBytes(match, p1) {
			return String.fromCharCode('0x' + p1);
		}));
}

function b64DecodeUnicode(str) {
	// Going backwards: from bytestream, to percent-encoding, to original string.
	return decodeURIComponent(atob(str).split('').map(function (c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));
}
