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
                joinable: !(room in gameStates) && sockets.size < 2
            }
        ])
    );

    //console.log(roomsObject);
    io.emit('rooms updated', roomsObject);
}
function newState(socket, room){
    return {
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
}
function checkForWin(board, user) {
    for (let r = 0; r < 3; r++) {
        if (
            board[r][0] === user &&
            board[r][1] === user &&
            board[r][2] === user
        ) return {start:{x:0,y:r},end:{x:2,y:r}};
    }

    for (let c = 0; c < 3; c++) {
        if (
            board[0][c] === user &&
            board[1][c] === user &&
            board[2][c] === user
        ) return {start:{x:c,y:0},end:{x:c,y:2}};
    }

    if (
        board[0][0] === user &&
        board[1][1] === user &&
        board[2][2] === user
    ) return {start:{x:0,y:0},end:{x:2,y:2}};

    if (
        board[0][2] === user &&
        board[1][1] === user &&
        board[2][0] === user
    ) return {start:{x:0,y:2},end:{x:2,y:0}};

    return null;
}

io.on('connection', (socket) => {
    emitRoomsUpdated();
    socket.on('disconnect', () => {
        emitRoomsUpdated();
    });

    socket.on('game join', (room)=>{
        socket.join(room);
        console.log(socket.id + ' joined '+ room);
        emitRoomsUpdated();

        if (gameStates[room]) {
            delete gameStates[room];
        }
        gameStates[room] = newState(socket, room);
        io.to(room).emit('game begin', {
            room,
            state: gameStates[room]
        });
    });

    socket.on('game leave', (room)=>{
        delete gameStates[room];
        io.to(room).emit('game leave');

        io.in(room).socketsLeave(room);
        const roomOwner = io.sockets.sockets.get(room);
        if (roomOwner) {
            roomOwner.join(room);
            //console.log(`${roomOwner.id} joined ${room}`);
        } else {
            console.log("no socket");
        }
        emitRoomsUpdated();

        console.log(socket.id + ' LEFT '+ room);
    });

    socket.on('game set symbol', (data)=>{
        //console.log(data);

        const room = data.room;
        const state = gameStates[room];

        const {r, c} = data.at;

        // ignore if tile already has something!!!
        if (state.board[r][c] != null)
            return;

        state.board[r][c] = data.id;

        //advance turn
        state.turn = state.turn == state.x? state.o: state.x;

        // check if somebody has won. if so, emit 'game end'
        const oLine = checkForWin(state.board, state.o);
        if (oLine){
            io.to(room).emit('game end', {
                room,
                state,
                winner: state.o, 
                line: oLine
            });
            state.turn = null;
            return;
        }
        const xLine = checkForWin(state.board, state.x);
        if (xLine){
            io.to(room).emit('game end', {
                room,
                state,
                winner: state.x, 
                line: xLine
            });
            state.turn = null;
            return;
        }

        io.to(room).emit('game update', {
            room,
            state
        });
    });

    socket.on('game reset', (room)=>{
        console.log('i was told to reset and i DID because im COOL')
        gameStates[room].board = [
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ];
        gameStates[room].turn = room;
        console.log(gameStates[room].turn);
        io.to(room).emit('game update', {
            room,
            state: gameStates[room]
        });
    });
});