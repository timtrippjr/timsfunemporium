const express = require('express');
const { Server } = require("socket.io");

const server = require('http').createServer(express());
const io = new Server(server);

app.use(express.static('public'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/tictactoe', (req, res) => {
    res.render('tictactoe');
});

io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);
    io.emit('rooms updated', [...io.sockets.adapter.rooms]);

    socket.on('join game', (data)=>{
        console.log(socket.id + ' wants to join '+ data);
        socket.join(data);
        io.emit('rooms updated');
        socket.emit('successfully joined', data);
    });

    socket.on('disconnect', () => {
        io.emit('rooms updated', [...io.sockets.adapter.rooms]);
    });
});

const port = 3000;
server.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}/`);
});