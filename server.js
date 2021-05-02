const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const {} = require('./games')
const {addUser, getUser, deleteUser, getUsers} = require('./users')


io.on('connection', (socket) => {
  socket.on("login", ({name, room}, callback) => {
  
  })
  socket.on("sendMessage", message => {
  
  })
  socket.on("disconnect", () => {
  
  })
})

app.get('/', (req, res) => {
  req.send('Server is up and running')
})

http.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
})

http.listen(3000, () => {
  console.log('listening on *:3000');
});