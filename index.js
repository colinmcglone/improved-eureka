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
  var currentRoom = null;

  socket.on('chat message', msg => {
    if (currentRoom == null) {
      io.emit('chat message', msg);
    } else {
      io.to(currentRoom).emit('chat message', msg);
    }
      
  });

  socket.on('join request', roomName => {
    socket.join(roomName);
    currentRoom = roomName;
    socket.emit('join room', roomName);
  });
});



http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});