const { createGame, joinGame, startGame, nextRound, gameState, activeCheck, legalBet } = require("./games.js");

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
  });

  socket.on('start game', currentRoom => {
    startGame(currentRoom);

    socket.to(currentRoom).emit('game update', gameState(currentRoom));
  });

  socket.on('place bet', bet => {
    if (activeCheck(currentRoom, socket)) {
      //active
      continue;
    } else {
      //not active player
      //send error
    }

    if (legalBet(currentRoom, socket, bet)) {
      //legal bet
      continue;
    } else {
      //not legal bet
      //send error
    }

    //update player info with bet

    //check if betting phase is over
      //update phase
      //or
      //next player bets
  });

  socket.on('play card', card => {
    //check if player is active
    //check if card is in hand
    //add card to play area

    //check if trick is over
      //assign trick win
        //check if hand is over
          //assign points
          //or
          //continue
      //or
      //increment active player
  });
    //get cards played

    //score round

    //end of game
});

io.of('/').adapter.on('create-room', (room) => {
  createGame(room);
});

io.of('/').adapter.on('join-room', (room, id) => {
  joinGame(room, id);
})

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});