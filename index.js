const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const {} = require('./games');
const {addUser, getUser, deleteUser, getUsers} = require('./users');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});