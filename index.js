const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = 3000;
const {} = require('./games');
const {addUser, getUser, deleteUser, getUsers} = require('./users');

socket.onopen = () => {
  socket.send("Hello!");
};

socket.onmessage = (data) => {
  console.log(data);
};

app.get('/', (req, res) => {
  res.send('Server is up and running')
});

http.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});