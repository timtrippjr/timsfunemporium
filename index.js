const express = require('express');
const { Server } = require("socket.io");

const app = express();
const server = require('http').createServer(app);

const io = new Server(server);

//config
app.use(express.static('public'));
app.set('view engine', 'pug');

//routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/tictactoe', (req, res) => {
    res.render('tictactoe');
});

const port = 3000;
server.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}/`);
});

//helpers
function emitRoomsUpdated(){
    const roomsObject = Object.fromEntries(
        [...io.sockets.adapter.rooms.entries()].map(([room, sockets]) => [
            room,
            [...sockets]
        ])
    );

    console.log(roomsObject);
    io.emit('rooms updated', roomsObject);
}

//connection
io.on('connection', (socket) => {
    emitRoomsUpdated();
    socket.on('disconnect', () => {
        emitRoomsUpdated();
    });

    socket.on('join game', (room)=>{
        socket.join(room);
        console.log(socket.id + ' joined '+ room);
        emitRoomsUpdated();
        io.to(room).emit('successfully joined', room);
    });
});