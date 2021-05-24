var cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
var suits = ["diamonds", "hearts", "spades", "clubs"];
var deck = new Array();
let games = new Map();

function getDeck() {
	var deck = new Array();

	for(var i = 0; i < suits.length; i++) {
		for(var x = 0; x < cards.length; x++) {
			var card = {Value: cards[x], Suit: suits[i]};
			deck.push(card);
		}
	}

	return deck;
}

function shuffle(deck) {
	for (var i = 0; i < 1000; i++) {
		var location1 = Math.floor((Math.random() * deck.length));
		var location2 = Math.floor((Math.random() * deck.length));
		var tmp = deck[location1];

		deck[location1] = deck[location2];
		deck[location2] = tmp;
	}
}

function deal(deck, target) {
    target.hand.unshift(deck.shift());
}

function resetCards(game) {
    game.table.players.forEach(element => element.hand = new Array());
    game.inPlay = new Array();
    game.discard = new Array();
    game.trump = new Array();
    game.deck = getDeck();
}

function createGame(room) {
    var game = {
        id: room,
        deck: getDeck(),
        phase: 0,
        rounds: new Array(),
        currentRound: 0,
        tricks: new Array(),
        currentTrick: 0,
        chat: new Array(),
        inPlay: new Array(),
        discard: new Array(),
        trump: new Array(),
        table: { 
          dealerPosition: 0, 
          activePosition: 0, 
          players: new Array()
        }
    }
    games.set(room, game);
}

function joinGame(room, id) {
    var game = games.get(room);
    var player = {
        id: id,
        score: 0,
        hand: new Array(),
        betTricks: 0,
        wonTricks: 0,
        tablePosition: 0
    }
    game.table.players.push(player);
}

function startGame(room) {
    var game = games.get(room);
    var maxHandSize = Math.floor(52/game.table.players.length);
    for (i = 1; i < maxHandSize; i++) {
        game.rounds.push(i);
    }
    for (i = maxHandSize; i >= 0; i--) {
        game.rounds.push(i);
    }
    game.currentRound = 0;

    game.table.players.forEach(element, index => element.tablePosition = index);
    game.table.activePosition = 1;
    
    nextRound(game);
}

function nextRound(game) {
    if (game.currentRound == (game.rounds * 2) - 1) {
        game.phase = 2;
    } else {
        game.currentRound += 1;
    }

    game.table.players.forEach(function(player) {
        player.betTricks = 0;
    });
    resetCards(game);
    shuffle(game.deck);

    for (var i = 0; i < game.currentRound; i++) {
        game.table.players.forEach(element => deal(deck, element));
    }
    game.trump.unshift(game.deck.shift());
}

function gameState(room) {
    var game = games.get(room);
    return game;
}

function activeCheck(room, id) {
    var game = games.get(room);
    var activePosition = game.table.activePosition;
    var check = new Boolean(false);

    if (id == game.table.players[activePosition].id) {
        check = true;
    }

    return check;
}

function phaseCheck(room) {
    var game = games.get(room);

    return game.phase;
}

function legalBet(room, id, bet) {
    var game = games.get(room);
    var dealerPosition = game.table.dealerPosition;
    var check = new Boolean(false);
    var betSum = 0;

    game.table.players.forEach(element => betSum += element.betTricks);

    if (id != game.table.players[dealerPosition].id) {
        check = true;
    } else if (id == game.table.players[dealerPosition].id && betSum != bet) {
        check = true;
    }

    return check;
}

function placeBet(room, id, bet) {
    var game = games.get(room);
    var player = game.table.players.filter(player => player.id == id)[0]
    var dealerPosition = game.table.dealerPosition;

    player.betTricks = bet;

    if (id == game.table.players[dealerPosition].id) {
        game.phase = 1;
    }

    game.table.activePosition = (game.table.activePosition + 1) % game.table.players.length;

    return {phase: game.phase, activePosition: game.table.activePosition};
}

function legalCard(room, id, card) {
    var game = games.get(room);
    var inPlay = game.inPlay;
    var check = new Boolean(false);
    var player = game.table.players.filter(player => player.id == id)[0]

    var followSuit = player.hand.every(cardInHand => cardInHand.suit != inPlay[0].suit);

    if (player.hand.includes(card)) {
        if (inPlay.length == 0 || inPlay[0].suit == card.suit || followSuit == false) {
            check = true;
        }
    }

    return check;
}

function playCard(room, id, card) {
    var game = games.get(room);
    var inPlay = game.inPlay;
    var player = game.table.players.filter(player => player.id == id)[0]

    player.hand.splice(player.hand.indexOf(card), 1);
    inPlay.push({card: card, player: player});

    return inPlay;    
}

function nextTrick(game, winner) {
    if (game.currentTrick == game.tricks) {
        //assign points
        game.table.players.forEach(function(player) {
            if (player.betTricks == player.wonTricks) {
                player.score += 10 + player.wonTricks;
            }
        });
        nextRound(game);
    } else {
        game.currentTrick += 1;
    }

    game.inPlay = new Array();
    game.table.dealerPosition = game.table.players.findOf(winner);
    game.table.activePosition = game.table.dealerPosition + 1;
    game.phase = 0;

    return {dealerPosition: dealerPosition, activePosition: activePosition};
}

function evaluateTrick(game) {
    //check if trick is over
    if (game.table.activePosition == game.table.dealerPosition) {
        //reduce inplay cards to active cards (either trump or lead suit)
        if (inPlay.some(card => card.card.suit == game.trump[0].suit)) {
            for (var i = inPlay.length - 1; i >= 1; i--) {
                if (inPlay[i].suit != game.trump[0].suit) {
                    inPlay.splice(i, 1);
                }
            }
        } else {
            for (var i = inPlay.length - 1; i >= 1; i--) {
                if (inPlay[i].suit != inPlay[0].suit) {
                    inPlay.splice(i, 1);
                }
            }
        }

        //who wins
        var winningCard = Math.max.apply(Math, inPlay.map(function(card){return card.card.value;}))

        var winningPlayer = inPlay.find(function(card) {return card.card.value == winningCard;}).player;

        game.table.players.forEach(function(player) {if (player == winningPlayer) {player.wonTricks += 1;}});

        nextTrick(game, winner);

    } else {
        game.table.activePosition = (game.table.activePosition + 1) % game.table.players.length;
    }

    return game;
}

module.exports = { createGame, joinGame, startGame, gameState, activeCheck, legalBet, placeBet, phaseCheck, legalCard, playCard, evaluateTrick };