const express = require('express');
const { stat } = require('fs');
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

//connection
const gameStates = {};

//helpers
function emitRoomsUpdated(){
    const roomsObject = Object.fromEntries(
        [...io.sockets.adapter.rooms.entries()].map(([room, sockets]) => [
            room, {   
                users: [...sockets],
                joinable: !(room in gameStates)
            }
        ])
    );

    console.log(roomsObject);
    io.emit('rooms updated', roomsObject);
}

io.on('connection', (socket) => {
    emitRoomsUpdated();
    socket.on('disconnect', () => {
        emitRoomsUpdated();
    });

    socket.on('join game', (room)=>{
        socket.join(room);
        console.log(socket.id + ' joined '+ room);
        emitRoomsUpdated();

        gameStates[room] = {
            x: socket.id,
            o: room,

            // will be ids
            board: [
                [null, null, null],
                [null, null, null],
                [null, null, null],
            ],
            turn: room
        };

        io.to(room).emit('game begin', {
            room,
            state: gameStates[room]
        });
    });

    socket.on('game set symbol', (data)=>{
        const room = data.room;
        const state = gameStates[room];

        const {r, c} = data.at;

        // ignore if tile already has something!!!
        if (state.board[r][c] != null)
            return;

        state.board[r][c] = data.id;

        // check if somebody has won. if so, emit 'game end'

        //advance turn
        state.turn = state.turn == state.x? state.o: state.x;

        io.to(room).emit('game update', {
            room,
            state
        });
    });
});