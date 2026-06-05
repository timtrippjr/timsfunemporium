var socket = io();
var game;

const roomsCont = document.getElementById('roomsContainer');
const gameCont = document.getElementById('gameContainer');
function showGame(){
    roomsCont.style.display = 'none';
    gameCont.style.display = 'block';
}
function showRooms(){
    gameCont.style.display = 'none';
    roomsCont.style.display = 'block';
}
showRooms();

class Game{
    constructor(gameId){
        this.canvas = document.getElementById(gameId);
        this.ctx = this.canvas.getContext('2d');

        this.tileSize = this.canvas.clientWidth / 3;
        console.log(this.canvas.clientWidth);
        console.log(this.tileSize);

        this.canvasClicked = this.canvasClicked.bind(this);
        this.canvas.addEventListener('click', this.canvasClicked);
        // keep an "idea" of game state, is updated 
        // when receiving a msg from server
        this.state = null;
        this.room = null;
        this.winner = null;

        // html stuff
        this.turnInd = document.getElementById('turnIndicator');

        this.drawBoard();
    }
    
    destroy() {
        this.canvas.removeEventListener('click', this.canvasClicked);
    }

    drawBoard(){
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(
            0, 0, 
            this.canvas.clientWidth, 
            this.canvas.clientHeight
        );

        /*/draw test text
        this.ctx.font = "bold 30px 'Times New Roman'";
        this.ctx.fillStyle = "blue";
        this.ctx.fillText('joined '+data.room, 50, 100);//*/

        // draw the lines of a tictactoe board
        this.ctx.fillStyle = 'gray';
        const barWidth = 2;
        const padding = 10;
        for (var i = 1; i <= 2; i++) {
            this.ctx.fillRect(
                (this.canvas.clientWidth / 3 * i) - (barWidth / 2), 
                padding, 
                barWidth, 
                this.canvas.clientHeight - (padding * 2)
            );
        }
        for (var i = 1; i <= 2; i++) {
            this.ctx.fillRect(
                padding, 
                (this.canvas.clientHeight / 3 * i) - (barWidth / 2), 
                this.canvas.clientWidth - (padding * 2),
                barWidth
            );
        }
    }

    canvasClicked(event) {
        if (!this.state) return;
        if (!this.room) return;
        if (this.winner) return;

        const rect = this.canvas.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const c = Math.floor(x/this.tileSize);
        const r = Math.floor(y/this.tileSize);
        //console.log(`Canvas coordinates: (${c}, ${r})`);
        //console.log("canvas clicked");

        if (this.state.turn == socket.id){
            console.log('room '+this.room);
            socket.emit('game set symbol', {
                room: this.room,
                id: socket.id, 
                at: {r, c},
            });
        }
    }

    update(){
        
        // update turn signal
        this.turnInd.innerText = this.state.turn+'\'s turnb';
        if (this.state.turn == socket.id) 
            this.turnInd.innerText = 'YOUR TURNB';

        if (this.winner)
            game.turnInd.innerText = 'YOU '+(
                this.winner == socket.id? 'WON': 'LOST'
            )+"!! ";

        // update board appearance (where x and os are)
        const xPlayer = this.state.x;
        const oPlayer = this.state.o;
        const board = this.state.board;

        this.ctx.font = "bold 80px 'Times New Roman'";


        this.drawBoard();

        for (let r = 0; r < board.length; r++){
            for (let c = 0; c < board[r].length; c++){

                if (board[r][c] == this.state.x){
                    this.ctx.fillStyle = "blue";
                    this.ctx.fillText(
                        'X', 
                        c*this.tileSize + 24, 
                        r*this.tileSize + 80
                    );
                }
                if (board[r][c] == this.state.o){
                    this.ctx.fillStyle = "red";
                    this.ctx.fillText(
                        'O', 
                        c*this.tileSize + 24, 
                        r*this.tileSize + 80
                    );
                }

            }
        }
    }
}

socket.on('rooms updated', (rooms) => {
    //console.log('refresh rooms',rooms);

    const roomsDiv = document.getElementById('rooms');
    roomsDiv.innerText = '';

    for (const [room, data] of Object.entries(rooms)){
        const users = data.users;
        const joinable = data.joinable;

        //console.log('joinable '+ joinable);
        //if (room == socket.id) continue;

        const roomDiv = newElem('div', roomsDiv);
        roomDiv.className = 'room';

        const roomTitle = newElem('strong', roomDiv);
        roomTitle.innerText = room;
        if (room == socket.id) {
            roomTitle.innerText += ' (you)';
        }else if(joinable){
            const kawaiiJoinButton = newElem('button', roomDiv);
            kawaiiJoinButton.innerText = 'join button bruh bruh';
            kawaiiJoinButton.className = 'joinButton floatr';
            kawaiiJoinButton.addEventListener('click', (e)=>{
                socket.emit('game join', room);
            });
        }

        //console.log(users);
        const innerRooms = newElem('ul', roomDiv);
        for (const user of users){
            const innerRoom = newElem('li', innerRooms);
            innerRoom.innerText = user;
            if (user == socket.id) 
                innerRoom.innerText += ' (you)';
        }
    }
});

socket.on('connect', ()=>{
    document.getElementById('loggedInMsg')
        .innerText = 'logged in as: ' + socket.id;
});
// show game board, hide available rooms.
socket.on('game begin', (data)=>{
    console.log(socket.id + ' joined ' + data.room);

    showGame();
    if(game)
        game.destroy();
    game = new Game('game');
    game.room = data.room;
    game.state = data.state;
    game.update();
});

socket.on('game end', (data)=>{
    game.winner = data.winner;
    game.room = data.room;
    game.state = data.state;
    game.update();

    // draw line over winning pattern.
    // eventually data will contain endpts of line to draw!
    console.log(data.line);

    const ctx = game.ctx;
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'yellow';
    ctx.beginPath();
    ctx.moveTo(
        game.tileSize * data.line.start.x + (game.tileSize / 2), 
        game.tileSize * data.line.start.y + (game.tileSize / 2)
    );
    ctx.lineTo(
        game.tileSize * data.line.end.x + (game.tileSize / 2), 
        game.tileSize * data.line.end.y + (game.tileSize / 2)
    );
    ctx.stroke();   
})

socket.on('game leave',()=>{
    if (game) {
        game.destroy();
        game = null;
    }
    showRooms();
});

socket.on('game update', (data)=>{
    game.room = data.room;
    game.state = data.state;
    game.winner = null;
    game.update();
});

document.getElementById('gameRESET').addEventListener('click',(e)=>{
    socket.emit('game reset', game.room);
});

document.getElementById('gameLEAVE').addEventListener('click',(e)=>{
    console.log(socket.id + ' leaves '+game.room);
    socket.emit('game leave', game.room);
});