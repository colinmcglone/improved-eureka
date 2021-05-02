const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = 3000;
const {} = require('./games');
const {addUser, getUser, deleteUser, getUsers} = require('./users');


io.on('connection', (socket) => {
  socket.on("login", ({name, room}, callback) => {
  
  });
  socket.on("sendMessage", message => {
  
  });
  socket.on("disconnect", () => {
  
  });
});

http.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});