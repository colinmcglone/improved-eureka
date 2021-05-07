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
});



http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});