const { createGame, joinGame, startGame, gameState, activeCheck, legalBet, placeBet, phaseCheck, legalCard, playCard, evaluateTrick } = require("./games.js");

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3000;
const {} = require('./games');
const {addUser, getUser, deleteUser, getUsers} = require('./users');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  var currentRoom = 'lobby';
  socket.join('lobby');

  socket.on('chat message', msg => {
    io.to(currentRoom).emit('chat message', msg);
  });

  socket.on('join request', roomName => {
    socket.leave(currentRoom);
    socket.join(roomName);
    currentRoom = roomName;
    socket.emit('join room', roomName);
    if (io.sockets.adapter.rooms.get(roomName).size == 1) {
      createGame(roomName);
    }
    joinGame(roomName, socket);
  });

  socket.on('start game', currentRoom => {
    console.log(currentRoom + ' starts game');

    startGame(currentRoom);

    var game = gameState(currentRoom);

    socket.to(currentRoom).emit('start game', 1);
    socket.to(currentRoom).emit('in play', game.inPlay);
    socket.to(currentRoom).emit('active position', game.table.activePosition);
    socket.to(currentRoom).emit('dealer position', game.table.dealerPosition);
    socket.to(currentRoom).emit('phase', game.phase);
    socket.to(currentRoom).emit('round', game.rounds[game.currentRound]);
    socket.to(currentRoom).emit('trick', game.tricks[game.currentTrick]);
    socket.to(currentRoom).emit('discard', game.discard);
    socket.to(currentRoom).emit('trump', game.trump);
    socket.to(currentRoom).emit('update hand', 1);

  });

  socket.on('place bet', bet => {
    if (activeCheck(currentRoom, socket)) {
      //active
    } else {
      //not active player
      socket.to(currentRoom).emit('error', {type: 'active', id: socket, value: bet, message: 'Player not active'});
      return;
    }

    if (legalBet(currentRoom, socket, bet)) {
      //legal bet
    } else {
      //not legal bet
      socket.to(currentRoom).emit('error', {type: 'bet', id: socket, value: bet, message: 'Illegal bet'});
      return;
    }

    if (phaseCheck(currentRoom) == 0) {
      //correct phase
    } else {
      socket.to(currentRoom).emit('error', {type: 'phase', id: socket, value: bet, message: 'Not betting phase'});
      return;
    }

    betResult = placeBet(currentRoom, socket, bet);
    
    if (betResult) {
      socket.to(currentRoom).emit('bet placed', {id: socket, bet: bet});
      socket.to(currentRoom).emit('phase', betResult.phase);
      socket.to(currentRoom).emit('active position', betResult.activePosition);
    } else {
      socket.to(currentRoom).emit('error', {type: 'bet', id: socket, bet: bet});
    }

  });

  socket.on('play card', card => {
    if (activeCheck(currentRoom, socket)) {
      //active
    } else {
      //not active player
      socket.to(currentRoom).emit('error', {type: 'active', id: socket, value: card, message: 'Player not active'});
      return;
    }

    if (legalCard(currentRoom, socket, card)) {
      //legal card
    } else {
      //not legal card
      socket.to(currentRoom).emit('error', {type: 'card', id: socket, value: card, message: 'Illegal card'});
      return;
    }

    if (phaseCheck(currentRoom) == 1) {
      //correct phase
    } else {
      socket.to(currentRoom).emit('error', {type: 'phase', id: socket, value: card, message: 'Not playing phase'});
      return;
    }

    var cardsInPlay = playCard(currentRoom, socket, card);
    socket.to(currentRoom).emit('in play', cardsInPlay);

    var game = evaluateTrick(currentRoom);

    if (game.phase == 2) {
      socket.to(currentRoom).emit('game over', game.table.players);
    } else {
      socket.to(currentRoom).emit('in play', game.inPlay);
      socket.to(currentRoom).emit('active position', game.table.activePosition);
      socket.to(currentRoom).emit('dealer position', game.table.dealerPosition);
      socket.to(currentRoom).emit('phase', game.phase);
      socket.to(currentRoom).emit('round', game.rounds[game.currentRound]);
      socket.to(currentRoom).emit('trick', game.tricks[game.currentTrick]);
      socket.to(currentRoom).emit('discard', game.discard);
      socket.to(currentRoom).emit('trump', game.trump);
      socket.to(currentRoom).emit('update hand', 1);
    }
  });
});

io.of('/').adapter.on('create-room', (room) => {
  createGame(room);
});

io.of('/').adapter.on('join-room', (room, id) => {
  joinGame(room, id);
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});